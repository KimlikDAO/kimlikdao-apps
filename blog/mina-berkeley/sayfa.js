import "/birim/cüzdan/birim";
import "/birim/dil/birim";
import dom from "/lib/util/dom";

/** @const {!Element} */
const ClaimButton = dom.adla("mbcl");

const Learn2EarnWorker = new Worker("/blog/mina-berkeley/contracts/Learn2EarnWorker.ts", { type: "module" });
Learn2EarnWorker.onmessage = console.log;

ClaimButton.onclick = () => Learn2EarnWorker.postMessage(new Uint8Array(33 + 256));
