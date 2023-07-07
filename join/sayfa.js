import Cüzdan from "/birim/cüzdan/birim";
import "/birim/dil/birim";
import { TCKT_ADDR } from "/lib/ethereum/TCKTLite";
import dom from "/lib/util/dom";
import { KimlikDAO } from "/sdk/client";

/** @const {!KimlikDAO} */
const Client = new KimlikDAO();

/** @const {Element} */
const BaşvurDüğmesi = dom.adla("joba");
/** @const {Element} */
const GitHubKutusu = dom.adla("joghi");
/** @const {Element} */
const EmailKutusu = dom.adla("joemi");
/** @const {Element} */
const TwitterKutusu = dom.adla("jotwi");

/** @type {Element} */
let SeçiliAçıklama = dom.adla("jod")
/** @type {Element} */
let SeçiliAd = null;

/**
 * Kullanıcının cüzdanın sahibi olduğunu kanıtlaması için imzalanmak üzere
 * sorguyu oluşturur.
 *
 * @param {string} ilan
 * @param {!did.DecryptedSections} decryptedSections
 * @return {!kimlikdao.Challenge}
 */
const sorguOluştur = (ilan, decryptedSections) => {
  /** @const {number} */
  const nonce = Date.now();
  /** @const {!did.PersonInfo} */
  const personInfo = /** @type {!did.PersonInfo} */(decryptedSections["personInfo"]);
  /** @const {string} */
  const formatted = new Date(nonce).toISOString()
    .slice(0, 16).replaceAll('-', '.').replace('T', ' ');
  return /** @type {!kimlikdao.Challenge} */({
    nonce,
    text: (dom.TR
      ? "Ben {}, KimlikDAO <> görevine başvurmak amacıyla kişisel bilgilerimin " +
      "KimlikDAO’ya yollanmasını onaylıyorum.\n\n"
      : "I, {}, hereby authorize the transmission of my personal information to " +
      "KimlikDAO in order to apply for the position of KimlikDAO <>.\n\n")
      .replace("{}", personInfo.first + " " + personInfo.last)
      .replace("<>", dom.adla("jod" + ilan).firstElementChild.innerText)
      + formatted
  });
}

/**
 * Kısa adı verilen ilani göster.
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
    dom.adlaGösterGizle("jotw", ilan.startsWith("ta"));
    dom.adlaGösterGizle("joem", ilan.startsWith("ge"));
    dom.adlaGösterGizle("jogh", ilan.startsWith("ge"));
  } else
    dom.adlaGizle("jobt");
  if (window.location.hash.slice(1) != ilan)
    window.location.hash = ilan;
}

/**
 * @param {Element} elm
 * @return {string} kullanıcıAdı
 */
const kullanıcıAdıKutusu = (elm) => {
  /** @type {string} */
  let value = elm.value.trim();
  if (value.endsWith("/"))
    value = value.slice(0, -1);
  if (value.includes("http"))
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
  const value = kullanıcıAdıKutusu(GitHubKutusu);
  window.localStorage["github"] = value;
  return fetch("//api.github.com/users/" + value.slice(1)).then((res) => {
    GitHubKutusu.nextElementSibling.innerText = res.ok ? "👍" : "🙅🏾"
    return res.ok;
  });
}

const twitterKutusuDüzelt = () => {
  const value = kullanıcıAdıKutusu(TwitterKutusu);
  if (value.length > 1) {
    window.localStorage["twitter"] = value;
    TwitterKutusu.nextElementSibling.innerText = "👍";
  }
}

/**
 * @return {boolean}
 */
const emailKutusuDüzelt = () => {
  /** @type {string} */
  let value = EmailKutusu.value;
  const isValid = value.indexOf("@") < value.lastIndexOf(".");
  EmailKutusu.nextElementSibling.innerText = isValid ? "👍" : "🙅🏾";
  if (isValid) window.localStorage["email"] = value;
  return isValid;
}

const cüzdanKoptu = () => {
  BaşvurDüğmesi.href = "javascript:";
  BaşvurDüğmesi.target = "";
  BaşvurDüğmesi.onclick = Cüzdan.bağla;
  BaşvurDüğmesi.innerText = dom.TR
    ? "Cüzdan bağla" : "Connect wallet";
}

const cüzdanBağlandı = () => {
  BaşvurDüğmesi.href = "javascript:";
  BaşvurDüğmesi.innerText = dom.TR ? "TCKT ile başvur" : "Apply with TCKT";
  Client.hasDID(TCKT_ADDR).then((hasTCKT) => {
    if (hasTCKT) {
      BaşvurDüğmesi.onclick = () => {
        /** @const {string} */
        const ilan = window.location.hash.slice(1);
        /** @const {boolean} */
        const geliştirici = ilan.startsWith("ge");
        if (geliştirici && !emailKutusuDüzelt()) return;
        /** @const {!Promise<boolean>} */
        const githubİyi = geliştirici ? githubKutusuDüzelt() : Promise.resolve(true);
        githubİyi.then((githubValid) => {
          if (!githubValid) return;
          BaşvurDüğmesi.innerText = dom.TR ? "Başvurunuz yollanıyor ⏳" : "Sending your application ⏳";
          return Client.getValidationRequest(
            TCKT_ADDR,
            ["personInfo", "contactInfo", "addressInfo", "kütükBilgileri"],
            (decryptedSections) => sorguOluştur(ilan, decryptedSections)
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
          }).catch(cüzdanBağlandı)
            .then((/** @type {Response} */ res) => {
              if (!res) return;
              BaşvurDüğmesi.innerText = res.ok
                ? dom.TR ? "Başvurunuz alındı 👍" : "Got your application 👍"
                : dom.TR ? "Bir hata oluştur 🫨" : "There is an issue 🫨"
              dom.düğmeDurdur(BaşvurDüğmesi);
              setTimeout(() => {
                BaşvurDüğmesi.classList.remove("dis");
                cüzdanBağlandı();
              }, 3000);
            })
        })
      }
    } else {
      BaşvurDüğmesi.innerText = "TCKT al";
      BaşvurDüğmesi.href = "https://kimlikdao.org/" + (dom.TR ? "al#sonra=" : "mint#then=") +
        encodeURIComponent("" + window.location);
    }
  })
}

const kur = () => {
  /** @const {Element} */
  const ilanlar = dom.adla("jobs");
  for (const elm of ilanlar.children)
    if (elm.classList == "joc")
      elm.onclick = () => ilanSeç(elm.id.slice(3));

  /** @const {string} */
  const ilan = window.location.hash.slice(1);
  if (ilan) ilanSeç(ilan);
  window.onhashchange = () => ilanSeç(window.location.hash.slice(1));
  dom.adla("joge").onclick = () => ilanSeç("");

  if (window["ethereum"])
    cüzdanKoptu();

  for (const elm of document.forms["jof"].elements) {
    const value = window.localStorage[elm.name];
    if (value) elm.value = value;
  }
  EmailKutusu.onpaste = EmailKutusu.onblur = emailKutusuDüzelt;
  GitHubKutusu.onpaste = GitHubKutusu.onblur = githubKutusuDüzelt;
  TwitterKutusu.onpaste = TwitterKutusu.onblur = twitterKutusuDüzelt;
  dom.adla("jonoi").onblur = dom.adla("jolii").onblur = (e) =>
    window.localStorage[e.target.name] = e.target.value;

  Cüzdan.bağlanınca(cüzdanBağlandı);
  Cüzdan.ağDeğişince(cüzdanBağlandı);
  Cüzdan.adresDeğişince(cüzdanBağlandı);
  Cüzdan.kopunca(cüzdanKoptu);
}

kur();
