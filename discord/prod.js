import { getHmac, roleRequestChallenge } from "/dapp/tcktm/discord";
import evm from "/lib/ethereum/evm";
import { TCKT as TCKTStub } from "/sdk/server-js/TCKT";

/** @define {string} */
const DISCORD_CLIENT_ID = "1068629633970487428";

/** @define {string} */
const DISCORD_GUILD_ID = "951587582712639548";

/** @const {string} */
const HOST_URL = "https://discord.kimlikdao.org";

/**
 * @const {string}
 * @noinline
 */
const DISCORD_API_URL = "https://discord.com/api/v10/";

/** @const {!Object<string, string>} */
const ROLE_IDS = {
  "TCKT HOLDER": "1069046438367088680"
};

const TCKT = new TCKTStub({
  "0xa86a": "https://api.avax-test.network/ext/bc/C/rpc",
  "0x1": "https://cloudflare-eth.com",
  "0x89": "https://polygon-rpc.com",
  "0xa4b1": "https://arb1.arbitrum.io/rpc",
  "0x38": "https://bsc.publicnode.com",
  "0xfa": "https://rpc.ankr.com/fantom",
});

/**
 * @param {number} status
 * @return {!Response}
 */
const err = (status) => new Response(null, {
  status,
  headers: { "access-control-allow-origin": "https://kimlikdao.org" }
});

/**
 * Adds the requested role if the requirements are satisfied.
 *
 * @param {!Request} req
 * @param {!DiscordEnv} env
 * @return {!Promise<!Response>|!Response}
 */
const addRole = (req, env) => req.json()
  .then(/** @type {function(*)} */((/** @type {!discord.RoleRequest} */ roleReq) => {
    if (getHmac(roleReq.discordID, env.HMAC_SECRET) != roleReq.discordID.hmac)
      return err(401);
    /** @const {string} */
    const digest = evm.personalDigest(
      roleRequestChallenge(roleReq.discordID, roleReq.role, roleReq.lang == "tr"));
    /** @const {string} */
    const address = evm.signerAddress(digest, roleReq.signature);
    switch (roleReq.role) {
      case "TCKT HOLDER":
        return TCKT.handleOf(roleReq.chainID, address)
          .then((/** @type {string} */ cidHex) => {
            if (evm.isZero(cidHex)) return err(412);
            /** @const {string} */
            const roleID = ROLE_IDS[roleReq.role];
            return fetch(DISCORD_API_URL + `guilds/${DISCORD_GUILD_ID}/`
              + `members/${roleReq.discordID.id}/roles/${roleID}`, {
              method: "PUT",
              headers: {
                "authorization": "Bot " + env.KIMLIKDAO_BOT_TOKEN,
                "content-type": "application/json"
              }
            }).then((res) => res.ok ? err(200) : err(401), () => err(400))
          },
            () => err(404))
      default:
        return err(405);
    }
  }))

/** @return {!Response} */
const kapat = () =>
  new Response("<!doctypehhtml><script>window.close()</script>", {
    headers: { "content-type": "text/html" }
  });

/**
 * @param {!Request} req
 * @param {!DiscordEnv} env
 * @return {!Promise<!Response>|!Response}
 */
const getDiscordID = (req, env) => {
  /** @const {string} */
  const code = new URLSearchParams(req.url.slice(HOST_URL.length + 1)).get("code") || "";
  if (!code) return kapat();

  /** @const {!oauth2.AccessTokenRequest} */
  const tokenRequest = {
    grant_type: "authorization_code",
    code,
    client_id: DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
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
    .then((data) => fetch(DISCORD_API_URL + "users/@me", {
      headers: { "authorization": "Bearer " + /** @type {!oauth2.AccessToken} */(data).access_token }
    }))
    .then((res) => res.json())
    .then((data) => {
      /** @const {string} */
      const disc = data["discriminator"];
      /** @const {!discord.SignedID} */
      const discordID = {
        id: data["id"],
        username: disc == "0" ? data["username"] : data["username"] + "#" + disc
      };
      discordID.hmac = getHmac(discordID, env.HMAC_SECRET);
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

/**
 * @implements {cloudflare.ModuleWorker}
 */
const DiscordWorker = {
  /**
   * @override
   *
   * @param {!cloudflare.Request} req
   * @param {!DiscordEnv} env
   * @param {!cloudflare.Context} _
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, _) {
    return req.url.length == HOST_URL.length + 1
      ? req.method == "GET"
        ? Response.redirect("https://discord.com/invite/H2wg6pcWXG")
        : req.method == "OPTIONS"
          ? approveCors()
          : addRole(req, env)
      : getDiscordID(req, env);
  }
}

globalThis["DiscordWorker"] = DiscordWorker;
