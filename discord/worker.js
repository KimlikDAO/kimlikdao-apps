import { roleRequestChallenge } from "/dapp/kpassim/discord";
import oauth2 from "/lib/api/oauth2.d";
import { ModuleWorker } from "/lib/birimler/cloudflare/moduleWorker.d";
import { ChainId, ChainGroup, chainIdToGroup } from "/lib/crosschain/chains";
import { keccak256 } from "/lib/crypto/sha3";
import evm from "/lib/ethereum/evm";
import { KPass as ServerKPass } from "/sdk/server-js/KPass";
import { signerAddress } from "/lib/ethereum/signer";
import { verifyMessage } from "/lib/mina/signer";

/** @define {string} */
const HOST_URL = "https://discord.kimlikdao.org";
/** @define {string} */
const DISCORD_CLIENT_ID = "1068629633970487428";
/** @define {string} */
const DISCORD_GUILD_ID = "951587582712639548";
/** @define {string} */
const DISCORD_CLIENT_SECRET = "DISCORD_CLIENT_SECRET";
/** @define {string} */
const KIMLIKDAO_BOT_TOKEN = "KIMLIKDAO_BOT_TOKEN";
/** @define {string} */
const HMAC_SECRET = "HMAC_SECRET";

/**
 * @const {string}
 * @noinline
 */
const DISCORD_API_URL = "https://discord.com/api/v10/";

/** @const {!Object<string, string>} */
const ROLE_IDS = {
  "KPASS HOLDER": "1069046438367088680"
};

/** @const {!ServerKPass} */
const KPass = new ServerKPass({
  [ChainId.xa86a]: "https://api.avax-test.network/ext/bc/C/rpc",
  [ChainId.x1]: "https://cloudflare-eth.com",
  [ChainId.x89]: "https://polygon-rpc.com",
  [ChainId.xa4b1]: "https://arb1.arbitrum.io/rpc",
  [ChainId.x38]: "https://bsc.publicnode.com",
  [ChainId.xfa]: "https://rpc.ankr.com/fantom",
});

/**
 * @param {!discord.SignedID} discordID
 * @param {string} secret
 * @return {string} hmac for the data fields
 */
const getHmac = (discordID, secret) => keccak256(
  JSON.stringify(discordID, ["id", "username"]) + secret);

/**
 * @param {number} status
 * @return {!Response}
 */
const respondWith = (status) => new Response(null, {
  status,
  headers: { "access-control-allow-origin": "https://kimlikdao.org" }
});

/**
 * Adds the requested role if the requirements are satisfied.
 *
 * @param {!Request} req
 * @return {!Promise<!Response>|!Response}
 */
const addRole = (req) => req.json()
  .then(/** @type {function(*)} */((/** @type {discord.RoleRequest} */ roleReq) => {
    if (getHmac(roleReq.discordID, HMAC_SECRET) != roleReq.discordID.hmac)
      return respondWith(401);
    /** @const {ChainId} */
    const chainId = /** @type {ChainId} */(roleReq.chainID);
    /** @const {ChainGroup} */
    const chainGroup = chainIdToGroup(chainId);
    /** @const {string} */
    const message = roleRequestChallenge(roleReq.discordID, roleReq.role, roleReq.lang == "tr");
    /** @const {string} */
    const address = chainGroup == ChainGroup.EVM
      ? signerAddress(evm.personalDigest(message),
        /** @type {eth.CompactSignature} */(roleReq.signerSignature))
      : /** @type {mina.SignerSignature} */(roleReq.signerSignature).signer;
    if (chainGroup == ChainGroup.MINA &&
      !verifyMessage(message, /** @type {mina.SignerSignature} */(roleReq.signerSignature)))
      return respondWith(400);

    switch (roleReq.role) {
      case "KPASS HOLDER":
        return KPass.handleOf(chainId, address)
          .then((/** @type {string} */ cidHex) => {
            if (evm.isZero(cidHex)) return respondWith(412);
            /** @const {string} */
            const roleID = ROLE_IDS[roleReq.role];
            return fetch(DISCORD_API_URL + `guilds/${DISCORD_GUILD_ID}/`
              + `members/${roleReq.discordID.id}/roles/${roleID}`, {
              method: "PUT",
              headers: {
                "authorization": "Bot " + KIMLIKDAO_BOT_TOKEN,
                "content-type": "application/json"
              }
            }).then((res) => res.ok ? respondWith(200) : respondWith(401), () => respondWith(400))
          },
            () => respondWith(404))
      default:
        return respondWith(405);
    }
  }))

/** @return {!Response} */
const kapat = () =>
  new Response("<!doctypehhtml><script>window.close()</script>", {
    headers: { "content-type": "text/html" }
  });

/**
 * @param {!Request} req
 * @return {!Promise<!Response>|!Response}
 */
const getDiscordID = (req) => {
  /** @const {string} */
  const code = new URLSearchParams(req.url.slice(HOST_URL.length + 1)).get("code") || "";
  if (!code) return kapat();

  /** @const {!oauth2.AccessTokenRequest} */
  const tokenRequest = {
    grant_type: "authorization_code",
    code,
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    redirect_uri: HOST_URL
  };
  return fetch(DISCORD_API_URL + "oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(/** @type {!Object<string, string>} */(tokenRequest))
  })
    .then((res) => res.json())
    .then((/** !Object */ data) => fetch(DISCORD_API_URL + "users/@me", {
      headers: { "authorization": "Bearer " + /** @type {!oauth2.AccessToken} */(data).access_token }
    }))
    .then((/** !Response */ res) => res.json())
    .then((/** !Object<string, string> */ data) => {
      /** @const {string} */
      const disc = data["discriminator"];
      /** @const {!discord.SignedID} */
      const discordID = {
        id: data["id"],
        username: disc == "0" ? data["username"] : data["username"] + "#" + disc
      };
      discordID.hmac = getHmac(discordID, HMAC_SECRET);
      return new Response(
        `<!doctypehtml><html><script>window.opener.postMessage(${JSON.stringify(discordID)
        },"https://kimlikdao.org");window.close()</script></html>`, {
        headers: { "content-type": "text/html;charset=utf-8" }
      })
    });
}

/** @return {!Response} */
const approveCors = () => new Response("", {
  headers: {
    "access-control-allow-origin": "https://kimlikdao.org",
    "access-control-allow-methods": "PUT",
    "access-control-allow-headers": "content-type"
  }
});

/** @implements {ModuleWorker} */
const DiscordWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req) {
    return req.url.length == HOST_URL.length + 1
      ? req.method == "GET"
        ? Response.redirect("https://discord.com/invite/H2wg6pcWXG")
        : req.method == "OPTIONS"
          ? approveCors()
          : addRole(req)
      : getDiscordID(req);
  }
};

export default DiscordWorker;
