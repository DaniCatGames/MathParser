import {SimplificationRule} from "../Typescript/Simplification";
import {SpecialNode} from "../Typescript/Match";
import {Nodes} from "../Node/NodeUtils";
import {Functions, Patterns, SpecialNodes} from "../Matching/Patterns";


export const ExponentiationRules: SimplificationRule[] = [
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
];