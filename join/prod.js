import { başvuruAl } from "./başvuru";
import { create } from "/lib/cloudflare/pageWorker";

/** @const {!cloudflare.ModuleWorker} */
const PageWorker = create("https://join.kimlikdao.org/", {
  "?tr": "join-tr.html",
  "?en": "join-en.html",
});

/**
 * @implements {cloudflare.ModuleWorker}
 */
const JoinWorker = {
  /**
   * @override
   *
   * @param {!cloudflare.Request} req
   * @param {!JoinEnv} env
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    return req.method == "POST"
      ? başvuruAl(req, env, ctx)
      : PageWorker.fetch(req, env, ctx);
  }
}

globalThis["JoinWorker"] = JoinWorker;
