import { HumanIDv1, HumanIDv1Witness, readPublicKey } from "@kimlikdao/sdk/mina/HumanIDv1";
import { MerkleTree, Mina, PublicKey } from "o1js";
import { LEARN2EARN, Learn2Earn } from "./Learn2Earn";

console.log("Worker loaded and parsed");

console.time("compiling Learn2Earn")

const Learn2EarnCompiled = Learn2Earn.compile().then(() => {
  console.timeEnd("compiling Learn2Earn");
  postMessage("compiled");
});

const learn2Earn = new Learn2Earn(PublicKey.fromBase58(LEARN2EARN));

const getWitness = (humanIDv1Id: bigint) =>
  Promise.resolve(new HumanIDv1Witness(new MerkleTree(33).getWitness(humanIDv1Id & 0xFFFFFFFFn)));

onmessage = (event) => {
  const sender = readPublicKey(event.data);
  const humanIDv1 = HumanIDv1.fromBytes(event.data.subarray(33));

  return Promise.all([getWitness(humanIDv1.id.toBigInt()), Learn2EarnCompiled])
    .then(([witness, _]) => Mina.transaction(sender, () => learn2Earn.claimReward(humanIDv1, witness))
      .prove()
      .then((tx) => postMessage(tx.toJSON())));
}
