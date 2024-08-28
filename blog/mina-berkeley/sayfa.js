import Cüzdan from "/birim/cüzdan/birim";
import "/birim/dil/birim";
import dom from "/lib/util/dom";
import { PublicKey } from "/lib/mina/mina";

/** @const {!Element} */
const ClaimButton = dom.adla("mbcl");
/** @const {!Element} */
const KPassButton = dom.adla("mbkp");

const Learn2EarnWorker = new Worker(
  "/blog/mina-berkeley/contracts/Learn2EarnWorker.ts",
  { type: "module" }
);
Learn2EarnWorker.onmessage = console.log;

ClaimButton.onclick = () => {
  const message = new Uint8Array(33 + 256);
  PublicKey.fromBase58(Cüzdan.adres()).serializeInto(message);

  Learn2EarnWorker.postMessage(message);
  Learn2EarnWorker.onmessage = (/** @type {!MessageEvent} */ msg) =>
    window.mina.sendTransaction({ transaction: msg.data })
      .then(console.log);
};

/** @type {Promise<!eth.ERC721Unlockable>} */
let DosyaSözü;

/**
 * @param {?string} _
 * @param {Promise<!EmitHelper.ERC721Unlockable>} dosyaSözü
 */
const kpassDeğişti = (_, dosyaSözü) => {
  /** @const {boolean} */
  const kpassVar = dosyaSözü != null;
  DosyaSözü = dosyaSözü;
}

kpassDeğişti("", null);

Cüzdan.kpassDeğişince(kpassDeğişti);