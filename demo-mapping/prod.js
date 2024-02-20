/** @define {string} */
const HOST_URL = "https://demo-mapping.kimlikdao.org/";

/**
 * @param {string} cid
 * @return {string}
 */
const normalize = (cid) => {
  if (!cid.startsWith("0x")) cid = "0x" + cid;
  return cid.toLowerCase();
}

/**
 * @implements {cloudflare.ModuleWorker}
 */
const DemoMapping = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!cloudflare.PageWorkerEnv} env
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    if (req.method == "GET")
      return env.KV.get(req.url.slice(HOST_URL.length).toLowerCase())
        .then((val) => new Response(val || "0x0", {
          headers: {
            "content-type": "text/plain",
            "access-control-allow-origin": "*"
          }
        }));
    if (req.method == "OPTIONS")
      return new Response("", {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "PUT",
          "access-control-allow-headers": "content-type"
        }
      })

    return req.json()
      .then((data) => env.KV.put(
        /** @type {string} */(data["address"]).toLowerCase(), normalize(data["cid"])))
      .then(() => new Response("", {
        headers: {
          "access-control-allow-origin": "*",
        }
      }))
  }
}

globalThis["DemoMapping"] = DemoMapping;
