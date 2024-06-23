import {
  HumanIDv1,
  HumanIDv1Witness,
  readPublicKey,
} from "@kimlikdao/sdk/mina/HumanIDv1";
import { MerkleMap, Mina, CircuitString, PublicKey, Field } from "o1js";

import KPassContract from "./KPass";

console.time("compiling KPass");

const KPassContractCompiled = KPassContract.compile().then(() => {
  console.timeEnd("compiling Learn2Earn");
  postMessage("compiled");
});

const Network = Mina.Network("https://api.minascan.io/node/devnet/v1/graphql");
Mina.setActiveInstance(Network);
console.log("Devnet network instance configured.");

const kPasses = new MerkleMap();

const addKPass = async (kPassHash: Field, sender: PublicKey) => {
  kPasses.set(sender.toFields()[2], kPassHash);
  return kPasses.getRoot();
}

onmessage = async (event) => {
  const sender = readPublicKey(event.data);
  const tx = await Mina.transaction(sender, async () => {
    addKPass(Field.fromBytes(event.data.subarray(33)), sender);
  })
  console.log("proving tx");
  console.time("proving tx");
  const proven = await tx.prove();
  console.timeEnd("proving tx");
  postMessage(proven.toJSON());
};
