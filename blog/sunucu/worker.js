import { create } from "/lib/birimler/cloudflare/kvPageWorker";

/** @const {ModuleWorker} */
const BlogWorker = create("https://blog.kimlikdao.org/", {
  "?tr": "blog/dizin-tr.html",
  "?en": "blog/dizin-en.html",
});

export default BlogWorker;
