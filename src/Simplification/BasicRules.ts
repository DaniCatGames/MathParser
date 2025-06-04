import { SpecialNode, SpecialNodes } from "../Typescript/Match";
import { SimplificationRule } from "../Typescript/Simplification";
import { Literal } from "../Typescript/Node";
import { PatternFunctions, Patterns } from "../Matching/Patterns";
import { LiteralUtils } from "../Node/Literal";
import { BasicNodes } from "../Node/BasicNodes";

const {
	Multiply, P,
} = PatternFunctions;

const {
	Literal, NegativeOne,
} = Patterns;

export const BasicRules: SimplificationRule[] = [
	{   // Literal * -1 -> negative
		pattern: Multiply(P(Literal), NegativeOne),
		requiredNodes: [SpecialNode.P],
		node: (node, nodes: SpecialNodes) => {
			return LiteralUtils.multiplyValues(nodes["P"] as Literal, BasicNodes.NegativeOne());
		},
	},
];