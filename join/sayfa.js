import Cüzdan from "/birim/cüzdan/birim";
import "/birim/dil/birim";
import { kur as kaydolKur } from "/birim/kaydol/birim";
import Tckt from "/birim/tckt/birim";
import TCKT from "/lib/ethereum/TCKTLite";
import dom from "/lib/util/dom";
import { getValidationRequest } from "/sdk/client";

/** @const {!Element} */
const BaşvurDüğmesi = /** @type {!Element} */(dom.adla("joba"));
/** @const {!Element} */
const GeriDüğmesi = /** @type {!Element} */(dom.adla("joge"));
/** @const {!Element} */
const BaşvurFormu = /** @type {!Element} */(dom.adla("jof"));
/** @const {!Element} */
const GitHubKutusu = /** @type {!Element} */(dom.adla("joghi"));
/** @const {!Element} */
const EmailKutusu = /** @type {!Element} */(dom.adla("joemi"));
/** @const {!Element} */
const TwitterKutusu = /** @type {!Element} */(dom.adla("jotwi"));

/** @type {Element} */
let SeçiliAçıklama = dom.adla("jod");
/** @type {Element} */
let SeçiliAd = null;

/**
 * Kullanıcının cüzdanın sahibi olduğunu kanıtlaması için imzalanmak üzere
 * sorguyu oluşturur.
 *
 * @param {string} ilan
 * @param {!did.DecryptedSections} decryptedSections
 * @param {boolean} anonimMi
 * @return {!kimlikdao.Challenge}
 */
const sorguOluştur = (ilan, decryptedSections, anonimMi) => {
  /** @const {number} */
  const nonce = Date.now();
  /** @const {string} */
  const sorguMetni = anonimMi
    ? dom.TR
      ? "KimlikDAO Ambassador görevine anonim olarak önkayıt yapmak istiyorum.\n\n"
      : "I would like to pre-apply for the KimlikDAO Ambassador program.\n\n"
    : (() => {
      /** @const {!did.PersonInfo} */
      const personInfo = /** @type {!did.PersonInfo} */(decryptedSections["personInfo"]);
      return (dom.TR
        ? "Ben {}, KimlikDAO <> görevine başvurmak amacıyla kişisel bilgilerimin " +
        "KimlikDAO’ya yollanmasını onaylıyorum.\n\n"
        : "I, {}, hereby authorize the transmission of my personal information to " +
        "KimlikDAO in order to apply for the position of KimlikDAO <>.\n\n")
        .replace("{}", personInfo.first + " " + personInfo.last)
        .replace("<>", dom.adla("jod" + ilan).firstElementChild.innerText)
    })();
  /** @const {string} */
  const formattedNonce = new Date(nonce).toISOString()
    .slice(0, 16).replaceAll('-', '.').replace('T', ' ');
  return /** @type {!kimlikdao.Challenge} */({
    nonce,
    text: sorguMetni + formattedNonce
  });
}

/**
 * Kısa adı verilen ilani gösterir.
 *
 * @param {string} ilan
 */
const ilanSeç = (ilan) => {
  dom.gizle(SeçiliAçıklama);
  SeçiliAçıklama = dom.adla("jod" + ilan);
  if (!SeçiliAçıklama) {
    SeçiliAçıklama = dom.adla("jod");
    ilan = "";
  }
  dom.göster(SeçiliAçıklama);

  if (SeçiliAd) SeçiliAd.classList.remove("sel");
  if (ilan) {
    SeçiliAd = dom.adla("joc" + ilan);
    SeçiliAd.classList.add("sel");
    dom.adlaGöster("jobt");
    dom.adlaGösterGizle("jotw", ilan.startsWith("sa"));
    dom.adlaGösterGizle("joem", ilan.startsWith("ge"));
    dom.adlaGösterGizle("jogh", ilan.startsWith("ge"));
    dom.adlaGösterGizle("joli", ilan.startsWith("ge"));
  } else
    dom.adlaGizle("jobt");
  if (window.location.hash.slice(1) != ilan)
    window.location.hash = ilan;
}

/**
 * @param {Element} elm
 * @return {string} kullanıcıAdı
 */
const kullanıcıAdıDüzelt = (elm) => {
  /** @type {string} */
  let value = elm.value.trim();
  if (value.endsWith("/"))
    value = value.slice(0, -1);
  if (value.includes("http") || value.includes(".com"))
    value = value.slice(value.lastIndexOf("/") + 1);
  if (value[0] != "@")
    value = "@" + value;
  elm.value = value;
  return value;
}

/**
 * @return {!Promise<boolean>}
 */
const githubKutusuDüzelt = () => {
  /** @const {string} */
  const value = kullanıcıAdıDüzelt(GitHubKutusu);
  window.localStorage["github"] = value;
  return fetch("//api.github.com/users/" + value.slice(1)).then((res) => {
    GitHubKutusu.nextElementSibling.innerText = res.ok ? "👍" : "🙅🏾"
    GitHubKutusu.classList.toggle("err", !res.ok);
    return res.ok;
  });
}

const twitterKutusuDüzelt = () => {
  /** @const {string} */
  const value = kullanıcıAdıDüzelt(TwitterKutusu);
  /** @const {boolean} */
  const isValid = value.length > 1;
  if (isValid) window.localStorage["twitter"] = value;

  TwitterKutusu.nextElementSibling.innerText = isValid ? "👍" : "🙅🏾";
  TwitterKutusu.classList.toggle("err", !isValid);
  return isValid;
}

/**
 * @return {boolean}
 */
const emailKutusuDüzelt = () => {
  /** @type {string} */
  let value = EmailKutusu.value;
  /** @const {boolean} */
  const isValid = value.indexOf("@") < value.lastIndexOf(".");
  EmailKutusu.nextElementSibling.innerText = isValid ? "👍" : "🙅🏾";
  EmailKutusu.classList.toggle("err", !isValid);
  if (isValid) window.localStorage["email"] = value;
  return isValid;
}

const sıfırla = () => {
  /** @const {Element} */
  const form = dom.adla("jof");
  form.reset();
  for (const elm of form.elements)
    delete window.localStorage[elm.name];
  [EmailKutusu, GitHubKutusu, TwitterKutusu].forEach(
    (e) => e.nextElementSibling.innerText = "");
}

/**
 * @param {Response} res
 * @param {!Promise<!eth.ERC721Unlockable>} dosyaSözü
 */
const başvuruSonrası = (res, dosyaSözü) => {
  if (!res) return;
  sıfırla();
  BaşvurDüğmesi.innerText = res.ok
    ? dom.TR ? "Başvurunuz alındı 👍" : "Got your application 👍"
    : dom.TR ? "Bir hata oluştur 🫨" : "There is an issue 🫨"
  dom.düğmeDurdur(BaşvurDüğmesi);
  setTimeout(() => {
    BaşvurDüğmesi.classList.remove("dis");
    tcktDeğişti("0x", dosyaSözü);
  }, 3000);
}

/**
 * Başvuru için gereken bilgileri toplayıp join.kimlikdao.org'a POST'lar.
 *
 * @param {!Promise<!eth.ERC721Unlockable>} dosyaSözü
 */
const başvur = (dosyaSözü) => {
  /** @const {string} */
  const ilan = window.location.hash.slice(1);
  /** @const {boolean} */
  const geliştirici = ilan.startsWith("ge");
  if (geliştirici && !emailKutusuDüzelt()) return;
  /** @const {boolean} */
  const ambassador = ilan.startsWith("sa-ambassador");
  if (ambassador && !twitterKutusuDüzelt()) return;

  /** @const {!Promise<boolean>} */
  const githubİyiSözü = geliştirici ? githubKutusuDüzelt() : Promise.resolve(true);

  githubİyiSözü.then((githubİyi) => {
    if (!githubİyi) return;
    BaşvurDüğmesi.innerText = dom.TR ? "Başvurunuz yollanıyor ⏳" : "Sending your application ⏳";
    return dosyaSözü.then((dosya) => getValidationRequest(
      Cüzdan.bağlantı(),
      Cüzdan.ağ(),
      TCKT.getAddress(Cüzdan.ağ()),
      /** @type {string} */(Cüzdan.adres()),
      dosya,
      ambassador ? ["humanID"] : ["personInfo", "contactInfo", "addressInfo", "kütükBilgileri"],
      (decryptedSections) => sorguOluştur(ilan, decryptedSections, ambassador)
    ).then((/** @type {!kimlikdao.ValidationRequest} */ istek) => {
      istek["ilan"] = ilan;
      istek["lang"] = dom.TR ? "tr" : "en";
      /** @const {!FormData} */
      const formData = new FormData(dom.adla("jof"));
      for (const entry of formData) {
        const value = entry[1];
        if (value) istek[entry[0]] = value;
      }
      return fetch("/", {
        method: "POST",
        headers: { "content-type": "application/json;charset=utf-8" },
        body: JSON.stringify(istek)
      })
    }).catch(() => tcktDeğişti("0x", dosyaSözü))
      .then((res) => başvuruSonrası(res, dosyaSözü))
    )
  })
}

/** @type {?string} */
let BağlaMetni;

/**
 * @param {?string} cidHex
 * @param {Promise<!eth.ERC721Unlockable>} dosyaSözü
 */
const tcktDeğişti = (cidHex, dosyaSözü) => {
  BaşvurDüğmesi.onclick = cidHex
    ? dosyaSözü
      ? () => başvur(/** @type {!Promise<!eth.ERC721Unlockable>} */(dosyaSözü))
      : () => window.location.href = "//kimlikdao.org/" + (dom.TR ? "al#sonra=" : "mint#then=") +
        encodeURIComponent("" + window.location)
    : () => {
      Cüzdan.aç();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  if (cidHex) {
    if (!BağlaMetni) BağlaMetni = BaşvurDüğmesi.innerText;
    BaşvurDüğmesi.innerText = dosyaSözü
      ? dom.TR ? "TCKT ile başvur" : "Apply with TCKT"
      : dom.TR ? "TCKT al" : "Mint your TCKT";
  } else if (BağlaMetni)
    BaşvurDüğmesi.innerText = BağlaMetni;
}

const kur = () => {
  /** @const {!NodeList<!Element>} */
  const ilanlar = dom.adla("jobs").children;
  for (const elm of ilanlar)
    if (elm.classList == "joc")
      elm.onclick = () => ilanSeç(elm.id.slice(3));

  /** @const {string} */
  const ilan = window.location.hash.slice(1);
  if (ilan) ilanSeç(ilan);
  window.onhashchange = () => ilanSeç(window.location.hash.slice(1));
  GeriDüğmesi.onclick = () => ilanSeç("");

  tcktDeğişti(null, null);
  Cüzdan.tcktDeğişince(tcktDeğişti);

  Tckt.Kök.onclick = Tckt.çevir;

  for (const elm of BaşvurFormu.elements) {
    /** @const {?string} */
    const value = window.localStorage[elm.name];
    if (value) elm.value = value;
  }
  EmailKutusu.onpaste = EmailKutusu.onblur = emailKutusuDüzelt;
  GitHubKutusu.onpaste = GitHubKutusu.onblur = githubKutusuDüzelt;
  TwitterKutusu.onpaste = TwitterKutusu.onblur = twitterKutusuDüzelt;
  dom.adla("jonoi").oninput = dom.adla("jolii").onblur = (e) =>
    window.localStorage[e.target.name] = e.target.value;
}

kur();
kaydolKur("kay");