import { PatternMatcher } from "../Matching/PatternMatcher";
import { Node, NodeType } from "../Typescript/Node";
import { SimplificationRule } from "../Typescript/Simplification";
import { NodeUtils } from "../Node/NodeUtils";

export class Simplifier {
	patternMatcher: PatternMatcher;

	constructor() {
		this.patternMatcher = new PatternMatcher();
	}

	simplify(node: Node, rules: SimplificationRule[]): Node {
		const simplifiedNode = this.simplifyChildren(node, rules);

		for(const rule of rules) {
			const result = this.patternMatcher.applyRuleWithPartialMatch(simplifiedNode, rule);
			if(result) {
				return this.simplify(result, rules);
			}
		}

		if((node.type === NodeType.Multiply || node.type === NodeType.Add) && node.args.size() === 1) {
			return node.args[0];
		}

		return simplifiedNode;
	}

	private simplifyChildren(node: Node, rules: SimplificationRule[]): Node {
		if(NodeUtils.hasArgs(node)) {
			const simplifiedArgs = node.args.map((arg) => this.simplify(arg, rules));
			return {
				...node,
				args: simplifiedArgs,
			};
		} else {
			return node;
		}
	}
}