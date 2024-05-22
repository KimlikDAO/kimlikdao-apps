import {
  HumanIDv1,
  HumanIDv1Witness,
  readPublicKey,
} from "@kimlikdao/sdk/mina/HumanIDv1";
import {
  Field,
  MerkleTree,
  Mina,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
} from "o1js";
import { Learn2Earn, Learn2EarnContract, LEARN2EARN } from "./Learn2Earn";

const NODE_HOSTNAME = "mina.kimlikdao.org";

console.time("compiling Learn2Earn");

const Learn2EarnCompiled = Learn2EarnContract.compile().then(() => {
  console.timeEnd("compiling Learn2Earn");
  postMessage("compiled");
});

const Network = Mina.Network("https://api.minascan.io/node/devnet/v1/graphql");
Mina.setActiveInstance(Network);
console.log("Devnet network instance configured.");

const getWitness = (humanIDv1Id: bigint): Promise<HumanIDv1Witness> =>
  fetch(`https://${NODE_HOSTNAME}/witness/${LEARN2EARN}/${(humanIDv1Id & 0xffffffffn).toString(16)}`)
    .then((res) => res.json())
    .then((data) => new HumanIDv1Witness(data));

const blindingCommit = (sender: PublicKey) => {
  const commitmentR = Field.random();
  return [
    commitmentR,
    Poseidon.hash([commitmentR, sender.x.add(sender.isOdd.toField())]),
  ];
};

const signHumanIDv1 = (humanIDv1Id: bigint, sender: PublicKey): HumanIDv1 => {
  const id = Field(humanIDv1Id);
  const [commitmentR, commitment] = blindingCommit(sender);
  return new HumanIDv1({
    id,
    commitmentR,
    sig0: Signature.create(PrivateKey.fromBigInt(1n), [id, commitment]),
    sig1: Signature.create(PrivateKey.fromBigInt(2n), [id, commitment]),
    sig2: Signature.create(PrivateKey.fromBigInt(3n), [id, commitment]),
  });
};

onmessage = async (event) => {
  const sender = readPublicKey(event.data);
  const humanIDv1 = signHumanIDv1(100n, sender); // HumanIDv1.fromBytes(event.data.subarray(33));
  const [witness] = await Promise.all([getWitness(humanIDv1.id.toBigInt()), Learn2EarnCompiled]);

  const tx = await Mina.transaction(sender, () =>
    Learn2Earn.claimReward(humanIDv1, witness)
  );
  console.log("proving tx");
  console.time("proving tx");
  const proven = await tx.prove();
  console.timeEnd("proving tx");
  postMessage(proven.toJSON());
};
