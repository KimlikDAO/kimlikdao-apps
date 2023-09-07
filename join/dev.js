import express from "express";
import { createServer } from "vite";
import { sayfaOku } from "../lib/util/birimler.js";

/** @const {!Object<string, { ad: string, dil: string }}>} */
const SAYFALAR = {
  "/": { ad: "join/sayfa.html", dil: "en" },
};

createServer({
  server: { middlewareMode: true },
  appType: 'custom'
}).then((vite) => {
  const app = express();
  app.use(vite.middlewares);
  app.use(express.json());
  app.use('/', (req, res, next) => {
    console.log(req.path);
    if (req.method == 'POST') {
      console.log(req.body);
      res.status(200).end();
    } else if (!(req.path in SAYFALAR)) {
      res.status(200).end(); // Dev sunucuda hata vermemeye çalış
    } else {
      let { ad, dil } = SAYFALAR[req.path];
      dil = "tr" in req.query ? "tr" : "en" in req.query ? "en" : dil;
      const sayfa = sayfaOku(ad, { dil, dev: true }, {});
      vite.transformIndexHtml(req.path, sayfa).then((sayfa) => {
        res.status(200)
          .set({ 'Content-type': 'text/html;charset=utf-8' })
          .end(sayfa);
      }).catch((e) => {
        vite.ssrFixStacktrace(e);
        next(e);
      });
    }
  });
  const port = 8789;
  console.log(`Ana sayfaya şu adreste çalışıyor: http://localhost:${port}`);
  app.listen(port);
});
