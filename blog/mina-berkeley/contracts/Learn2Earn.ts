import {
  HumanIDv1,
  HumanIDv1Witness,
  PerHumanIDv1Contract,
} from "@kimlikdao/sdk/mina/HumanIDv1";
import { PublicKey, method } from "o1js";

const MINA = 1e9;

const LEARN2EARN = "B62qnnFm3SEtrMgStoj4SRVxKSTERh8Ho3Y9jCCa8TvgBF1mqa97Sij";

class Learn2EarnContract extends PerHumanIDv1Contract {
  @method async claimReward(humanIDv1: HumanIDv1, witness: HumanIDv1Witness) {
    const sender = this.sender.getUnconstrained();
    this.acceptHumanIDv1(sender, humanIDv1, witness);
    this.send({ to: sender, amount: 10 * MINA });
  }
}

const Learn2Earn = new Learn2EarnContract(PublicKey.fromBase58(LEARN2EARN));

export { LEARN2EARN, Learn2Earn, Learn2EarnContract };
