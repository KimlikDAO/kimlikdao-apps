import { başvuruAl } from "./başvuru";
import { create } from "/lib/birimler/cloudflare/kvPageWorker";
import { KvPageWorkerEnv } from "/lib/birimler/cloudflare/kvPageWorker.d";
import { CfRequest, Context } from "/lib/birimler/cloudflare/moduleWorker.d";

/** @const {ModuleWorker} */
const PageWorker = create("https://join.kimlikdao.org/", {
  "?tr": "join-tr.html",
  "?en": "join-en.html",
});

/** @const {ModuleWorker} */
const JoinWorker = {
  /**
   * @param {!CfRequest} req
   * @param {!KvPageWorkerEnv=} env
   * @param {!Context=} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    return req.method == "POST"
      ? başvuruAl(req)
      : PageWorker.fetch(req, env, ctx);
  }
}

export default JoinWorker;
