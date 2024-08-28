import { Başvuru } from "./başvuru.d";
import { sendEmail } from "/lib/birimler/email";
import { Validator } from "/sdk/server-js/validator";

/** @define {string} */
const APPLICATION_RECIPIENTS = "dao@kimlikdao.org";

/** @const {!Object<string, string>} */
const İlanAdı = {
  "ge-ui1": "UI Geliştirici",
  "ge-sdk1": "SDK Geliştirici",
  "sa-ambassador1": "Ambassador",
};

/**
 * Verilen bir sorgunun doğruluğunu şu şekilde onaylar:
 *   (1) Sorgu metni nonce'ı içermeli
 *   (2) Nonce çok eski olmamalı (veya gelecekten olmamalı)
 *
 * @param {!kimlikdao.Challenge} challenge
 * @return {boolean}
 */
const sorguyuOnayla = (challenge) => {
  /** @const {number} */
  const now = Date.now();
  /** @const {number} */
  const nonce = /** @type {number} */(challenge.nonce);
  /** @const {string} */
  const formatted = new Date(nonce).toISOString()
    .slice(0, 16).replaceAll('-', '.').replace('T', ' ');

  return nonce < now + 1e7 && nonce + 1e8 > now &&
    challenge.text.endsWith(formatted);
}

/** @const {!Validator} */
const KPassValidator = new Validator({
  "0xa86a": "https://api.avax-test.network/ext/bc/C/rpc",
  "0x1": "https://cloudflare-eth.com",
  "0x89": "https://polygon-rpc.com",
  "0xa4b1": "https://arb1.arbitrum.io/rpc",
  "0x38": "https://bsc.publicnode.com",
  "0xfa": "https://rpc.ankr.com/fantom",
}, null, sorguyuOnayla);

/**
 * Başvuru yapana başvurusunun alındığına dair email yollar.
 *
 * @param {!Başvuru} başvuru
 * @return {!Promise<!Response>|void}
 */
const alındıEmailiYolla = (başvuru) => {
  if (!başvuru.email) return;
  /** @const {did.PersonInfo} */
  const personInfo = /** @type {did.PersonInfo} */(
    /** @type {!kimlikdao.ValidationRequest} */(başvuru).decryptedSections["personInfo"]);
  /** @const {string} */
  const ilanAdı = İlanAdı[başvuru.ilan];
  /** @const {string} */
  const name = personInfo
    ? personInfo.first + " " + personInfo.last
    : başvuru.twitter
  return sendEmail({
    from: "KimlikDAO <dao@kimlikdao.org>",
    to: `${name} <${başvuru.email}>`,
    subject: `KimlikDAO ${ilanAdı} başvurunuz`,
    html: `Sevgili ${personInfo ? personInfo.first : başvuru.twitter},<br>` +
      `KimlikDAO <a href="https://join.kimlikdao.org/#${başvuru.ilan}">${ilanAdı}</a> başvurunu aldık. ` +
      "En kısa zamanda iletişime geçeceğiz.<p>" +
      "Bu esnada KimlikDAO hakkında daha fazla bilgi edinmek için:<table>" +
      '<tr><td>GitHub:</td><td><a href="https://github.com/KimlikDAO">https://github.com/KimlikDAO</a></td></tr>' +
      '<tr><td>Twitter:</td><td><a href="https://twitter.com/KimlikDAO">https://twitter.com/KimlikDAO</a></td></tr>' +
      '<tr><td>Docs:</td><td><a href="https://docs.kimlikdao.org">https://docs.kimlikdao.org</a></td></tr>' +
      '</table></p>' +
      "Sevgiler,<br>KimlikDAO"
  });
}

/**
 * Başvuru paketini DAO'ya email olarak ilet.
 *
 * @param {!Başvuru} başvuru
 * @param {boolean} isValid
 * @return {!Promise<!Response>|!Promise<void>}
 */
const başvuruEmailiYolla = (başvuru, isValid) => {
  /** @const {did.PersonInfo} */
  const personInfo = /** @type {did.PersonInfo} */(
    /** @type {!kimlikdao.ValidationRequest} */(başvuru).decryptedSections["personInfo"]);
  /** @const {string} */
  const ilanAdı = İlanAdı[başvuru.ilan];
  return sendEmail({
    from: "KimlikDAO <dao@kimlikdao.org>",
    to: APPLICATION_RECIPIENTS.split(","),
    subject: `Yeni başvuru: ${ilanAdı}, ` + (personInfo
      ? personInfo.first + " " + personInfo.last
      : başvuru.twitter),
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><table>` +
      `<tr><td>TCKT geçerli mi:</td><td>${isValid ? "Evet" : "Hayır"}</td></tr>` +
      `<tr><td>Konum:</td><td><a href="https://join.kimlikdao.org/#${başvuru.ilan}">${ilanAdı} (${başvuru.ilan})</a></td></tr>` +
      (başvuru.email
        ? `<tr><td>Email:</td><td>${başvuru.email}</td></tr>`
        : "") +
      (personInfo
        ? `<tr><td>Ad:</td><td>${personInfo.first} ${personInfo.last}</td></tr>` +
        `<tr><td>TCKN:</td><td>${personInfo.localIdNumber.slice(2)}</td></tr>`
        : "") +
      (başvuru.github
        ? `<tr><td>GitHub:</td><td><a href="https://github.com/${başvuru.github.slice(1)}">${başvuru.github}</a></td></tr>`
        : "") +
      (başvuru.twitter
        ? `<tr><td>Twitter:</td><td><a href="https://twitter.com/${başvuru.twitter.slice(1)}">${başvuru.twitter}</a></td></tr>`
        : "") +
      (başvuru.linkedin
        ? `<tr><td>LinkedIn:</td><td>${başvuru.linkedin}</td></tr>`
        : "") +
      (başvuru.notes
        ? `<tr><td>Notes:</td><td>${başvuru.notes}</td></tr>`
        : "") +
      `</table><pre>${JSON.stringify(başvuru)}</pre></html>`
  });
}

/**
 * @param {!Request} req
 * @return {!Promise<!Response>}
 */
const başvuruAl = (req) => req
  .json()
  .then((başvuru) =>
    KPassValidator.validateRequest(/** @type {!kimlikdao.ValidationRequest} */(başvuru))
      .then((/** @type {!kimlikdao.ValidationReport} */ report) => Promise.all([
        report.isValid && alındıEmailiYolla(/** @type {!Başvuru} */(başvuru)),
        başvuruEmailiYolla(/** @type {!Başvuru} */(başvuru), report.isValid)
      ]).then(() => new Response(JSON.stringify(report), {
        status: report.isValid ? 200 : 400
      })))
  )

export { başvuruAl };
