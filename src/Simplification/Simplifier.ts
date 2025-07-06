import { PatternMatcher } from "../Matching/PatternMatcher";
import { Node, NodeType } from "../Typescript/Node";
import { SimplificationRule } from "../Typescript/Simplification";
import { NodeUtils } from "../Node/NodeUtils";

export class Simplifier {
	patternMatcher: PatternMatcher;

	constructor(matcher?: PatternMatcher) {
		this.patternMatcher = matcher || new PatternMatcher();
	}

	Simplify(node: Node, rules: SimplificationRule[]): Node {
		const simplifiedNode = this.SimplifyChildren(node, rules);

		for(const rule of rules) {
			const result = this.patternMatcher.ApplyRuleWithPartialMatch(simplifiedNode, rule);
			if(result) {
				return this.Simplify(result, rules);
			}
		}

		if((node.type === NodeType.Multiply || node.type === NodeType.Add) && node.args.size() === 1) {
			return node.args[0];
		}

		return simplifiedNode;
	}

	private SimplifyChildren(node: Node, rules: SimplificationRule[]): Node {
		if(NodeUtils.HasArgs(node)) {
			const simplifiedArgs = node.args.map((arg) => this.Simplify(arg, rules));
			return {
				...node,
				args: simplifiedArgs,
			};
		} else {
			return node;
		}
	}
}