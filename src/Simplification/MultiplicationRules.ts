import { Literal } from "../Typescript/Node";
import { SimplificationRule } from "../Typescript/Simplification";
import { SpecialNode } from "../Typescript/Match";
import { PatternFunctions, Patterns } from "../Matching/Patterns";
import { BasicNodes } from "../Node/BasicNodes";
import { LiteralUtils } from "../Node/Literal";
import { Nodes, NodeUtils } from "../Node/NodeUtils";

const {
	Multiply, Exponentiation, P, Q,
} = PatternFunctions;

const {
	Literal, Zero, One, SpecialNodes, NegativeOne,
} = Patterns;

export const MultiplicationRules: SimplificationRule[] = [
	{   // P * 0 => 0
		pattern: Multiply(Zero),
		requiredNodes: [],
		node: (_, __) => Nodes.Zero(),
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
			return LiteralUtils.multiplyValues(nodes["P"] as Literal, Nodes.NegativeOne());
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

	{   // P * P^Q -> P^(Q+1)
		pattern: Multiply(SpecialNodes.P, Exponentiation(SpecialNodes.P, SpecialNodes.Q)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (_, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], NodeUtils.AddOne(nodes["Q"]));
		},
	},

	{   // P^Q * P^R -> P^(Q+R)
		pattern: Multiply(
			Exponentiation(SpecialNodes.P, SpecialNodes.Q),
			Exponentiation(SpecialNodes.P, SpecialNodes.R)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q, SpecialNode.R],
		children: (_, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], BasicNodes.Add(nodes["Q"], nodes["R"]));
		},
	},
];