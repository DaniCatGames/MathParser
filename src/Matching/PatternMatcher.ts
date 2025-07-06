import { MatchNode, Pattern, SpecialNodes } from "../Typescript/Match";
import { Node, NodeType } from "../Typescript/Node";
import { SimplificationRule } from "../Typescript/Simplification";
import { PatternExpander } from "./PatternExpander";
import { Object } from "../Polyfill/Object";
import { NodeUtils } from "../Node/NodeUtils";
import { ComplexUtils } from "../Math/Symbolic/Complex";

interface MatchResult {
	matched: boolean;
	specialNodes?: SpecialNodes;
	matchedIndices?: number[]; // For partial matches in arrays
}

export class PatternMatcher {
	readonly expander;

	constructor() {
		this.expander = new PatternExpander();
	}

	ApplyRuleWithPartialMatch(node: Node, rule: SimplificationRule): Node | undefined {
		const expandedPatterns = this.expander.expand(rule.pattern);

		for(const pattern of expandedPatterns) {
			let result = this.MatchPattern(node, pattern);

			if(!result.matched && (node.type === NodeType.Add || node.type === NodeType.Multiply)) {
				result = this.FindPartialMatches(node, pattern);
			} else if("args" in node) {
				result.matchedIndices = this.GetIndicesArray(node.args.size());
			}

			if(result.matched && result.specialNodes) {
				const hasAllRequired = rule.requiredNodes.every(
					reqNode => result.specialNodes![reqNode] !== undefined,
				);

				if(hasAllRequired) {
					if(rule.node) {
						return rule.node(node, result.specialNodes);
					} else if(rule.children && result.matchedIndices) {
						return this.ReplaceChildren(node, rule, result.specialNodes, result.matchedIndices);
					}
				}
			}
		}

		return undefined;
	}

	Match(node: Node, pattern: Pattern): MatchResult {
		const expandedPatterns = this.expander.expand(pattern);

		for(const pattern of expandedPatterns) {
			let result = this.MatchPattern(node, pattern);

			if(!result.matched && (node.type === NodeType.Add || node.type === NodeType.Multiply)) {
				result = this.FindPartialMatches(node, pattern);
			}

			if(result.matched && result.specialNodes) {
				return {
					matched: result.matched,
					specialNodes: result.specialNodes,
				};
			}
		}

		return {
			matched: false,
		};
	}

	private MatchPattern(node: Node, pattern: MatchNode): MatchResult {
		const specialNodes: SpecialNodes = {};

		if(this.MatchSingleNode(node, pattern, specialNodes)) {
			return {matched: true, specialNodes};
		}

		return {matched: false};
	}

	private MatchSingleNode(node: Node, pattern: MatchNode, specialNodes: SpecialNodes) {
		if(pattern.specialNode) {
			if(specialNodes[pattern.specialNode] !== undefined) {
				if(!NodeUtils.Equal(node, specialNodes[pattern.specialNode])) {
					return false;
				}
			} else {
				specialNodes[pattern.specialNode] = node;
			}
		}

		if(pattern.type !== undefined && node.type !== pattern.type) {
			return false;
		}

		if(pattern.string !== undefined && NodeUtils.HasString(node) && node.string !== pattern.string) {
			return false;
		} else if(pattern.string !== undefined && !NodeUtils.HasString(node)) {
			return false;
		}

		if(pattern.number !== undefined && NodeUtils.HasNumber(node)) {
			if(!ComplexUtils.Equal(node.number, pattern.number)) {
				return false;
			}
		} else if(pattern.number !== undefined && !NodeUtils.HasNumber(node)) {
			return false;
		}

		if(pattern.conditions) {
			for(const condition of pattern.conditions) {
				if(!condition(node)) return false;
			}
		}

		if(pattern.args && NodeUtils.HasArgs(node)) {
			return this.MatchArgs(node.args, pattern.args, specialNodes);
		} else if(pattern.args !== undefined && !NodeUtils.HasArgs(node)) {
			return false;
		}

		return true;
	}

	private MatchArgs(nodeArgs: Node[], patternArgs: MatchNode[], specialNodes: SpecialNodes) {
		if(nodeArgs.size() !== patternArgs.size()) {
			return false;
		}

		for(let i = 0; i < nodeArgs.size(); i++) {
			if(!this.MatchSingleNode(nodeArgs[i], patternArgs[i], specialNodes)) {
				return false;
			}
		}

		return true;
	}

	private FindPartialMatches(node: Node, pattern: MatchNode): MatchResult {
		if(!NodeUtils.HasArgs(node) || !pattern.args) {
			return {matched: false};
		}

		if(node.type !== NodeType.Add && node.type !== NodeType.Multiply) {
			return {matched: false};
		}

		if(node.type !== pattern.type) {
			return {matched: false};
		}

		let specialNodes: SpecialNodes = {};
		const matchedIndices: number[] = [];

		const combinations = this.GenerateCombinations(node.args, pattern.args.size());

		for(const combo of combinations) {
			const tempSpecialNodes: SpecialNodes = {};
			let allMatch = true;

			for(let i = 0; i < combo.nodes.size(); i++) {
				if(!this.MatchSingleNode(combo.nodes[i], pattern.args[i], tempSpecialNodes)) {
					allMatch = false;
					break;
				}
			}

			if(allMatch) {
				specialNodes = Object.assign(specialNodes, tempSpecialNodes);
				combo.indices.forEach((index) => {
					matchedIndices.push(index);
				});
				return {matched: true, specialNodes, matchedIndices};
			}
		}

		return {matched: false};
	}

	private ReplaceChildren(node: Node, rule: SimplificationRule, specialNodes: SpecialNodes, matchedIndices: number[]) {
		if(!NodeUtils.HasArgs(node) || !rule.children) {
			return node;
		}

		const newArg = rule.children(node, specialNodes);
		const newArgs = [...node.args];

		matchedIndices.sort((a, b) => a > b);
		matchedIndices.forEach((i) => {
			newArgs.remove(i);
		});

		newArgs.push(newArg);

		return {
			...node,
			args: newArgs,
		};
	}

	private GenerateCombinations(nodes: Node[], count: number) {
		if(count > nodes.size()) return [];
		if(count === 0) return [{nodes: [], indices: []}];
		if(count === nodes.size()) return [{nodes: [...nodes], indices: this.GetIndicesArray(nodes.size())}];

		const combinations: Array<{ nodes: Node[], indices: number[] }> = [];

		function backtrack(start: number, current: Node[], indices: number[]) {
			if(current.size() === count) {
				combinations.push({nodes: [...current], indices: [...indices]});
				return;
			}

			for(let i = start; i < nodes.size(); i++) {
				current.push(nodes[i]);
				indices.push(i);
				backtrack(i + 1, current, indices);
				current.pop();
				indices.pop();
			}
		}

		backtrack(0, [], []);
		return combinations;
	}

	private GetIndicesArray(size: number) {
		const array: number[] = [];
		for(let i = 0; i < size; i++) {
			array.push(i);
		}
		return array;
	}
}