import {SimplificationRule} from "../Typescript/Simplification";
import {Literal} from "../Typescript/Node";
import {SpecialNode} from "../Typescript/Match";
import {LiteralUtils} from "../Node/Literal";
import {Nodes, NodeUtils} from "../Node/NodeUtils";
import {Functions, Patterns, SpecialNodes} from "../Matching/Patterns";


export const AdditionRules: SimplificationRule[] = [
	{   // p + 0 => p
		pattern: Functions.Add(SpecialNodes.P(), Patterns.Wildcard()),
		requiredNodes: [SpecialNode.P],
		children: (_, nodes) => nodes["P"],
	},

	{   // R + R => (R + R)
		pattern: Functions.Add(SpecialNodes.PFunction(Patterns.Literal()), SpecialNodes.QFunction(Patterns.Literal())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (_, nodes) => {
			return LiteralUtils.AddValues(nodes["P"] as Literal, nodes["Q"] as Literal);
		},
	},

	{   // qp + p => (q + 1)p
		pattern: Functions.Add(SpecialNodes.P(), Functions.Multiply(SpecialNodes.Q(), SpecialNodes.P())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (_, nodes) => {
			return Nodes.Multiply(nodes["P"], NodeUtils.AddOne(nodes["Q"]));
		},
	},

	{   // qp + rp => (r + q)p
		pattern: Functions.Add(Functions.Multiply(SpecialNodes.Q(), SpecialNodes.P()), Functions.Multiply(SpecialNodes.R(), SpecialNodes.P())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q, SpecialNode.R],
		children: (_, nodes) => {
			return Nodes.Multiply(nodes["P"], Nodes.Add(nodes["Q"], nodes["R"]));
		},
	},
];