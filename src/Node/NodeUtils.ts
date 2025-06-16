import { Node, NodeType } from "../Typescript/Node";
import { BasicNodes } from "./BasicNodes";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export class NodeUtils {
	static AddOne(node: Node) {
		return BasicNodes.Add(node, BasicNodes.Literal(1));
	}

	static hasArgs(node: Node) {
		return "args" in node;
	}

	static hasString(node: Node) {
		return "string" in node;
	}

	static hasNumber(node: Node) {
		return "number" in node;
	}

	static getArgs(node: Node) {
		if(this.hasArgs(node)) {
			return node.args;
		} else {
			return undefined;
		}
	}

	static equal(a: Node, b: Node) {
		if(a.type !== b.type) return false;

		if(this.hasString(a) && this.hasString(b)) {
			if(a.string !== b.string) return false;
		} else if(this.hasString(a) !== this.hasString(b)) {
			return false;
		}

		if(this.hasNumber(a) && this.hasNumber(b)) {
			if(!ComplexUtils.equal(a.number, b.number)) return false;
		} else if(this.hasNumber(a) !== this.hasNumber(b)) {
			return false;
		}

		if(this.hasArgs(a) && this.hasArgs(b)) {
			if(a.args.size() !== b.args.size()) return false;
			for(let i = 0; i < a.args.size(); i++) {
				if(!this.equal(a.args[i], b.args[i])) return false;
			}
		} else if(this.hasArgs(a) !== this.hasArgs(b)) {
			return false;
		}

		return true;
	}
}

export class NodeTests {
	static Literal(node: Node) {
		return node.type === NodeType.Literal;
	}

	static Variable(node: Node) {
		return node.type === NodeType.Variable;
	}

	static Constant(node: Node) {
		return node.type === NodeType.Constant;
	}

	static Operator(node: Node) {
		return this.Add(node) || this.Multiply(node) || this.Exponentiation(node) || this.Absolute(node) || this.Factorial(node);
	}

	static Add(node: Node) {
		return node.type === NodeType.Add;
	}

	static Multiply(node: Node) {
		return node.type === NodeType.Multiply;
	}

	static Exponentiation(node: Node) {
		return node.type === NodeType.Exponentiation;
	}

	static Equals(node: Node) {
		return node.type === NodeType.Equals;
	}

	static Absolute(node: Node) {
		return node.type === NodeType.Absolute;
	}

	static Factorial(node: Node) {
		return node.type === NodeType.Factorial;
	}

	static Function(node: Node) {
		return node.type === NodeType.Function;
	}

	static List(node: Node) {
		return node.type === NodeType.List;
	}

	static Tensor(node: Node) {
		return node.type === NodeType.Tensor;
	}

	static Zero(node: Node) {
		return this.Literal(node) && ComplexUtils.equal(node.number, ComplexUtils.zero());
	}
}