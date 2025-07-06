import { PatternFunctions, Patterns } from "../Matching/Patterns";
import { SimplificationRule } from "../Typescript/Simplification";
import { Literal } from "../Typescript/Node";
import { SpecialNode } from "../Typescript/Match";
import { LiteralUtils } from "../Node/Literal";
import { Nodes, NodeUtils } from "../Node/NodeUtils";

const {
	Add, Multiply, P, Q,
} = PatternFunctions;

const {
	Literal, Zero, SpecialNodes,
} = Patterns;

export const AdditionRules: SimplificationRule[] = [
	{   // p + 0 => p
		pattern: Add(SpecialNodes.P, Zero),
		requiredNodes: [SpecialNode.P],
		children: (node, nodes) => nodes["P"],
	},

	{   // R + R => (R + R)
		pattern: Add(P(Literal), Q(Literal)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (node, nodes) => {
			return LiteralUtils.AddValues(nodes["P"] as Literal, nodes["Q"] as Literal);
		},
	},

	{   // qp + p => (q + 1)p
		pattern: Add(SpecialNodes.P, Multiply(SpecialNodes.Q, SpecialNodes.P)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (node, nodes) => {
			return Nodes.Multiply(nodes["P"], NodeUtils.AddOne(nodes["Q"]));
		},
	},

	{   // qp + rp => (r + q)p
		pattern: Add(Multiply(SpecialNodes.Q, SpecialNodes.P), Multiply(SpecialNodes.R, SpecialNodes.P)),
		requiredNodes: [SpecialNode.P, SpecialNode.Q, SpecialNode.R],
		children: (node, nodes) => {
			return Nodes.Multiply(nodes["P"], Nodes.Add(nodes["Q"], nodes["R"]));
		},
	},
];