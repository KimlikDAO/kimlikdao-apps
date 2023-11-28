import { devSunucu } from "../../lib/util/sunucu.js";

devSunucu({
  port: 1616,
  kök: "blog",
  dizin: "dizin",
  sayfalar: [
    ["eliptik-egriler", "elliptic-curves"],
    ["eliptik-imza", "ecdsa"]
  ]
});
