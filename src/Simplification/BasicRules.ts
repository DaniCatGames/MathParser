import {SpecialNode} from "../Typescript/Match";
import {SimplificationRule} from "../Typescript/Simplification";
import {Literal} from "../Typescript/Node";
import {LiteralUtils} from "../Node/Literal";
import {BasicNodes} from "../Node/BasicNodes";
import {Nodes} from "../Node/NodeUtils";
import {Functions, Patterns, SpecialNodes} from "../Matching/Patterns";



export const BasicRules: SimplificationRule[] = [
	{   // P^0 -> 1
		pattern: Functions.Exponentiation(Patterns.Wildcard(), Patterns.Zero()),
		requiredNodes: [],
		node: (_, __) => Nodes.One(),
	},

	{   // P^1 -> P
		pattern: Functions.Exponentiation(SpecialNodes.P(), Patterns.One()),
		requiredNodes: [SpecialNode.P],
		node: (_, nodes) => nodes["P"],
	},
	{   // p + 0 => p
		pattern: Functions.Add(SpecialNodes.P(), Patterns.Zero()),
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
	{   // P * 0 => 0
		pattern: Functions.Multiply(Patterns.Zero()),
		requiredNodes: [],
		node: (_, __) => Nodes.Zero(),
	},

	{   // P * 1 => P
		pattern: Functions.Multiply(SpecialNodes.P(), Patterns.One()),
		requiredNodes: [SpecialNode.P],
		children: (_, nodes) => nodes["P"],
	},

	{   // Literal * -1 -> negative
		pattern: Functions.Multiply(SpecialNodes.PFunction(Patterns.Literal()), Patterns.NegativeOne()),
		requiredNodes: [SpecialNode.P],
		node: (_, nodes) => {
			return LiteralUtils.MultiplyValues(nodes["P"] as Literal, Nodes.NegativeOne());
		},
	},

	{   // Literal * Literal => Literal
		pattern: Functions.Multiply(SpecialNodes.PFunction(Patterns.Literal()), SpecialNodes.QFunction(Patterns.Literal())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (_, nodes) => {
			return LiteralUtils.MultiplyValues(nodes["P"] as Literal, nodes["Q"] as Literal);
		},
	},

	{   // P * P -> P^2
		pattern: Functions.Multiply(SpecialNodes.P(), SpecialNodes.P()),
		requiredNodes: [SpecialNode.P],
		children: (_, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], nodes["Q"]);
		},
	},
];