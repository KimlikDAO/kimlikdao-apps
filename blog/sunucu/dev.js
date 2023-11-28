import { devSunucu } from "../../lib/util/sunucu.js";

devSunucu(8789, {
  "/": { ad: "blog/dizin/sayfa.html", dil: "tr" },
  "/?tr": { ad: "blog/dizin/sayfa.html", dil: "tr" },
  "/?en": { ad: "blog/dizin/sayfa.html", dil: "en" },
  "/eliptik-egriler": { ad: "blog/eliptik-egriler/sayfa.html", dil: "tr" },
  "/elliptic-curves": { ad: "blog/elliptic-curves/sayfa.html", dil: "en" },
  "/ecdsa": { ad: "blog/ecdsa/sayfa.html", dil: "tr" }
});
