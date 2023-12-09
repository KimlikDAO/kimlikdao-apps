import { çalıştır } from "../../lib/birimler/devSunucu.js";

çalıştır({
  port: 8787,
  kök: "blog",
  dizin: "dizin",
  sayfalar: [
    ["eliptik-egriler", "elliptic-curves"],
    ["eliptik-imza", "ecdsa"]
  ]
});
