import { SimplificationRule } from "../Typescript/Simplification";
import { SpecialNode } from "../Typescript/Match";
import { PatternFunctions, Patterns } from "../Matching/Patterns";
import { BasicNodes } from "../Node/BasicNodes";

const {
	Exponentiation,
} = PatternFunctions;

const {
	Zero, One, Wildcard, SpecialNodes,
} = Patterns;

export const ExponentiationRules: SimplificationRule[] = [
	{   // P^0 -> 1
		pattern: Exponentiation(Wildcard, Zero),
		requiredNodes: [],
		node: (_, __) => BasicNodes.One(),
	},

	{   // P^1 -> P
		pattern: Exponentiation(SpecialNodes.P, One),
		requiredNodes: [SpecialNode.P],
		node: (_, nodes) => nodes["P"],
	},
];