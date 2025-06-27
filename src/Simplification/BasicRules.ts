import { SpecialNode } from "../Typescript/Match";
import { SimplificationRule } from "../Typescript/Simplification";
import { Literal } from "../Typescript/Node";
import { PatternFunctions, Patterns } from "../Matching/Patterns";
import { LiteralUtils } from "../Node/Literal";
import { BasicNodes } from "../Node/BasicNodes";

const {
	Multiply, P, Q, Exponentiation, Add,
} = PatternFunctions;

const {
	Literal, NegativeOne, SpecialNodes, Wildcard, Zero, One,
} = Patterns;

export const BasicRules: SimplificationRule[] = [
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
	{   // p + 0 => p
		pattern: Add(SpecialNodes.P, Zero),
		requiredNodes: [SpecialNode.P],
		children: (node, nodes) => nodes["P"],
	},

	{   // R + R => (R + R)
		pattern: Add(P(Literal), Q(Literal)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (node, nodes) => {
			return LiteralUtils.addValues(nodes["P"] as Literal, nodes["Q"] as Literal);
		},
	},
	{   // P * 0 => 0
		pattern: Multiply(Zero),
		requiredNodes: [],
		node: (_, __) => BasicNodes.Zero(),
	},

	{   // P * 1 => P
		pattern: Multiply(SpecialNodes.P, One),
		requiredNodes: [SpecialNode.P],
		children: (_, nodes) => nodes["P"],
	},

	{   // Literal * -1 -> negative
		pattern: Multiply(P(Literal), NegativeOne),
		requiredNodes: [SpecialNode.P],
		node: (node, nodes) => {
			return LiteralUtils.multiplyValues(nodes["P"] as Literal, BasicNodes.NegativeOne());
		},
	},

	{   // Literal * Literal => Literal
		pattern: Multiply(P(Literal), Q(Literal)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (node, nodes) => {
			return LiteralUtils.multiplyValues(nodes["P"] as Literal, nodes["Q"] as Literal);
		},
	},

	{   // P * P -> P^2
		pattern: Multiply(SpecialNodes.P, SpecialNodes.P),
		requiredNodes: [SpecialNode.P],
		children: (node, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], nodes["Q"]);
		},
	},
];