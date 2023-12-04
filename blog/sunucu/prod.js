import { create } from "/lib/cloudflare/pageWorker";

/** @const {!cloudflare.ModuleWorker} */
const BlogWorker = create("https://blog.kimlikdao.org/", {
  "?tr": "blog/dizin-tr.html",
  "?en": "blog/dizin-en.html",
});

globalThis["BlogWorker"] = BlogWorker;
export default BlogWorker;
