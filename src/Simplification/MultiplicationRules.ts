import {Literal} from "../Typescript/Node";
import {SimplificationRule} from "../Typescript/Simplification";
import {SpecialNode} from "../Typescript/Match";
import {BasicNodes} from "../Node/BasicNodes";
import {LiteralUtils} from "../Node/Literal";
import {Nodes, NodeUtils} from "../Node/NodeUtils";
import {Functions, Patterns, SpecialNodes} from "../Matching/Patterns";

export const MultiplicationRules: SimplificationRule[] = [
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

	{   // P * P^Q -> P^(Q+1)
		pattern: Functions.Multiply(SpecialNodes.P(), Functions.Exponentiation(SpecialNodes.P(), SpecialNodes.Q())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q],
		children: (_, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], NodeUtils.AddOne(nodes["Q"]));
		},
	},

	{   // P^Q * P^R -> P^(Q+R)
		pattern: Functions.Multiply(
			Functions.Exponentiation(SpecialNodes.P(), SpecialNodes.Q()),
			Functions.Exponentiation(SpecialNodes.P(), SpecialNodes.R())),
		requiredNodes: [SpecialNode.P, SpecialNode.Q, SpecialNode.R],
		children: (_, nodes) => {
			return BasicNodes.Exponentiation(nodes["P"], BasicNodes.Add(nodes["Q"], nodes["R"]));
		},
	},
];