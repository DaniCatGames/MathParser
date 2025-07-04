import { Node, NodeType } from "../Typescript/Node";
import { NodeTests, NodeUtils } from "./NodeUtils";
import { Pattern } from "../Typescript/Match";

const typeMap = new Map<NodeType, string>([
	[NodeType.Literal, "0"],
	[NodeType.Variable, "1"],
	[NodeType.Constant, "2"],

	[NodeType.Add, "3"],
	[NodeType.Multiply, "4"],
	[NodeType.Exponentiation, "5"],
	[NodeType.Equals, "6"],
	[NodeType.Absolute, "7"],
	[NodeType.Factorial, "8"],

	[NodeType.Function, "9"],

	[NodeType.List, "A"],
	[NodeType.Tensor, "B"],
]);

export class NodeSerializer {
	static ToString(node: Node): string {
		let toReturn = "{";

		toReturn += typeMap.get(node.type);

		if(NodeUtils.HasNumber(node)) {
			toReturn += `:${node.number.real.numerator}|${node.number.real.denominator}|${node.number.imaginary.numerator}|${node.number.imaginary.denominator}`;
		}

		if(NodeUtils.HasString(node)) {
			toReturn += `:${node.string}`;
		}

		if(NodeTests.Tensor(node)) {
			toReturn += `:${node.shape.join("|")}`;
		}

		if(NodeUtils.HasArgs(node)) {
			toReturn += `:${node.args.map(arg => this.ToString(arg)).join("|")}`;
		}

		toReturn += "}";
		return toReturn;
	}

	static PatternToString(pattern: Pattern): string {
		let toReturn = "[";

		pattern.forEach((node, index) => {
			if(index !== 0) toReturn += ":";
			let toAdd = "{";

			if(node.type) toAdd += typeMap.get(node.type);
			toAdd += ":";
			if(node.string) toAdd += node.string;
			toAdd += ":";
			if(node.number) toAdd += `:${node.number.real.numerator}|${node.number.real.denominator}|${node.number.imaginary.numerator}|${node.number.imaginary.denominator}`;
			toAdd += ":";
			if(node.args) {
				toAdd += "[";
				node.args.forEach((arg, index) => {
					if(index !== 0) toAdd += ":";
					toAdd += this.PatternToString(arg);
				});
				toAdd += "]";
			}
			toAdd += ":";
			if(node.conditions) {
				toAdd += "[";
				node.conditions.forEach((condition, index) => {
					if(index !== 0) toAdd += ":";
					toAdd += game.GetService("HttpService").JSONEncode(condition);
				});
				toAdd += "]";
			}
			toAdd += ":";
			if(node.specialNode) toAdd += node.specialNode;
			toAdd += ":";
			if(node.commutative === true) {
				toAdd += "1";
			} else if(node.commutative === false) {
				toAdd += "0";
			}
			toAdd += "}";

			toReturn += toAdd;
		});

		toReturn += "]";
		return toReturn;
	}
}