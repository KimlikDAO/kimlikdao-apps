import { uploadWorker } from "@kimlikdao/lib/birimler/cloudflare/targets";
import { readDefines } from "@kimlikdao/lib/birimler/js/util";
import { compile as compileJs } from "@kimlikdao/lib/kdjs/compile";

const compile = async () => compileJs({
  entry: "discord/worker.js",
  output: "build/discord/worker.js",
  define: await readDefines("discord/.gizli.toml", "discord/worker")
});

const deployToCf = (env) => compile()
  .then((code) => uploadWorker(env.cloudflare.auth, "kimlikdao-discord", code));

export default {
  compile,
  deployToCf
};
