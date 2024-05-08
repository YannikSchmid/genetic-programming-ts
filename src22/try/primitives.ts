import * as base from "../base";
import * as qfns from "../quickfns";

const tNumber = () => new base.NameType("number");
const tBoolean = () => new base.NameType("boolean");

const pset = new base.PrimitiveSet("main", [tNumber(), tNumber(), tNumber()], tBoolean());
pset.addPrimitive(qfns.not, [tBoolean()], tBoolean(), "not");
pset.addPrimitive(qfns.and, [tBoolean(), tBoolean()], tBoolean(), "and");
pset.addPrimitive(qfns.or, [tBoolean(), tBoolean()], tBoolean(), "or");
pset.addTerminal(true, tBoolean());
pset.addTerminal(false, tBoolean());

pset.addPrimitive(qfns.eq, [tNumber(), tNumber()], tBoolean(), "eq");
pset.addPrimitive(qfns.neg, [tNumber()], tNumber(), "neg");
pset.addPrimitive(qfns.add, [tNumber(), tNumber()], tNumber(), "add");
pset.addPrimitive(qfns.sub, [tNumber(), tNumber()], tNumber(), "sub");
pset.addTerminal(1, tNumber());
pset.addTerminal(0, tNumber());

export default pset;
