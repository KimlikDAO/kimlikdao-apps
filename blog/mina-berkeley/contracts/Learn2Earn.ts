import {
  HumanIDv1,
  HumanIDv1Witness,
  PerHumanIDv1Contract,
} from "@kimlikdao/sdk/mina/HumanIDv1";
import { method } from "o1js";

const MINA = 1e9;

const LEARN2EARN = "B62qrzBYPHRZ6FsQpZCw5FbgvRbFh2jFHY2DT35pWjJc9K5Mbq2zppH";

class Learn2Earn extends PerHumanIDv1Contract {
  @method async claimReward(humanIDv1: HumanIDv1, witness: HumanIDv1Witness) {
    const sender = this.sender.getUnconstrained();
    this.acceptHumanIDv1(sender, humanIDv1, witness);
    this.send({ to: sender, amount: 10 * MINA });
  }
}

export { LEARN2EARN, Learn2Earn };
