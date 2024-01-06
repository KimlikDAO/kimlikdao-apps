import { create } from "/lib/cloudflare/pageWorker";

/** @define {string} */
const DISCORD_CLIENT_ID = "1068629633970487428";

/** @const {string} */
const URL = "https://discord.kimlikdao.org/";

/** @const {!cloudflare.ModuleWorker} */
const PageWorker = create(URL, {
  "tckt-onayla": "tckt-onayla-tr.html",
  "verify-tckt": "tckt-onayla-en.html"
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
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    if (req.url.length == URL.length)
      return Response.redirect("https://discord.com/invite/H2wg6pcWXG");
    if (req.url.endsWith("/TCKT")) {
      return Response.redirect("https://discord.com/api/oauth2/authorize" +
        `?client_id=${DISCORD_CLIENT_ID}` +
        `&redirect_uri=${URL}verify_TCKT` +
        "&response_type=code&scope=role_connections.write+identify" +
        "&prompt=consent");
    }
    return PageWorker.fetch(req, env, ctx);
  }
}

globalThis["DiscordWorker"] = DiscordWorker;
