"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const base = __importStar(require("../base"));
const qfns = __importStar(require("../quickfns"));
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
exports.default = pset;
//# sourceMappingURL=primitives.js.map