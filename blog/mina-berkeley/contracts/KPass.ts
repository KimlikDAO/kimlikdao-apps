import { 
  SmartContract, 
  state, 
  State, 
  Field, 
  MerkleMapWitness 
} from "o1js";

const EmptyRoot =
  Field(22731122946631793544306773678309960639073656601863129978322145324846701682624n);

class KPassContract extends SmartContract {
  @state(Field) mapRoot = State<Field>();

  init() {
    super.init();
    this.mapRoot.set(EmptyRoot);
  }

  addKPass(kPassHash: Field, witness: MerkleMapWitness, newRoot: Field) {
    const sender = this.sender.getAndRequireSignature();
    this.mapRoot.getAndRequireEquals();
    newRoot.assertEquals(witness.computeRootAndKey(kPassHash)[1]);
    this.mapRoot.set(witness.computeRootAndKey(kPassHash)[1]);
  }
}

export default KPassContract;