import { Add, Literal, Multiply, Node, NodeType } from "../Typescript/Node";
import { BasicNodes } from "./BasicNodes";
import { ComplexUtils } from "../Math/Symbolic/Complex";
import { LiteralUtils } from "./Literal";

export class NodeUtils {
	static AddOne(node: Node) {
		return BasicNodes.Add(node, BasicNodes.Literal(1));
	}

	static HasArgs(node: Node) {
		return "args" in node;
	}

	static HasString(node: Node) {
		return "string" in node;
	}

	static HasNumber(node: Node) {
		return "number" in node;
	}

	static GetArgs(node: Node) {
		if(this.HasArgs(node)) {
			return node.args;
		} else {
			return undefined;
		}
	}

	static Equal(a: Node, b: Node) {
		if(a.type !== b.type) return false;

		if(this.HasString(a) && this.HasString(b)) {
			if(a.string !== b.string) return false;
		} else if(this.HasString(a) !== this.HasString(b)) {
			return false;
		}

		if(this.HasNumber(a) && this.HasNumber(b)) {
			if(!ComplexUtils.Equal(a.number, b.number)) return false;
		} else if(this.HasNumber(a) !== this.HasNumber(b)) {
			return false;
		}

		if(this.HasArgs(a) && this.HasArgs(b)) {
			if(a.args.size() !== b.args.size()) return false;
			for(let i = 0; i < a.args.size(); i++) {
				if(!this.Equal(a.args[i], b.args[i])) return false;
			}
		} else if(this.HasArgs(a) !== this.HasArgs(b)) {
			return false;
		}

		return true;
	}

	static QuickFlat<T extends Add | Multiply>(node: T): T {
		const newArgs: Node[] = [];
		node.args.forEach(arg => {
			if(arg.type === node.type) {
				arg.args.forEach(argarg => newArgs.push(argarg));
			} else {
				newArgs.push(arg);
			}
		});

		return {
			type: node.type,
			args: newArgs,
		} as T;
	}

	static CombineLiterals(nodeType: NodeType.Add | NodeType.Multiply, ...nodes: Node[]): Node[] {
		const args: Node[] = [];
		const literals: Literal[] = [];

		nodes.forEach(node => {
			if(node.type === NodeType.Literal) {
				literals.push(node);
			} else {
				args.push(node);
			}
		});

		if(literals.size() > 0) {
			args.push(
				nodeType === NodeType.Add ? LiteralUtils.AddValues(...literals) : LiteralUtils.MultiplyValues(...literals),
			);
		}

		return args;
	}
}

export class Nodes {
	static Multiply(...nodes: Node[]): Node {
		let returnNode: Node;
		const combined = NodeUtils.CombineLiterals(NodeType.Multiply, ...nodes);

		if(combined.size() === 0) {
			returnNode = this.Zero();
		} else if(combined.size() === 1) {
			returnNode = combined[0];
		} else {
			returnNode = NodeUtils.QuickFlat({
				type: NodeType.Multiply,
				args: combined,
			});
		}

		if(NodeTests.Multiply(returnNode) && returnNode.args.every(arg => NodeTests.Zero(arg))) {
			returnNode = this.Zero();
		}

		return returnNode;
	}

	static Add(...nodes: Node[]): Node {
		const combined = NodeUtils.CombineLiterals(NodeType.Add, ...nodes);

		if(combined.size() === 0) {
			return this.Zero();
		} else if(combined.size() === 1) {
			return combined[0];
		} else {
			return NodeUtils.QuickFlat({
				type: NodeType.Add,
				args: combined,
			});
		}
	}

	static Divide(node1: Node, node2: Node): Node {
		return this.Multiply(node1, Nodes.Inverse(node2));
	}

	static Subtract(node1: Node, node2: Node): Node {
		return this.Add(node1, this.Multiply(node2, this.NegativeOne()));
	}

	static Exponentiation(node1: Node, node2: Node): Node {
		if(NodeTests.Exponentiation(node1)) {
			node2 = this.Multiply(node1.args[1], node2);

			if(NodeTests.Zero(node2)) return this.One();
			else if(NodeTests.One(node2)) return node1.args[0];
			else return BasicNodes.Exponentiation(node1.args[0], node2);
		} else {
			if(NodeTests.Zero(node2)) return this.One();
			else if(NodeTests.One(node2)) return node1;
			else return BasicNodes.Exponentiation(node1, node2);
		}
	}

	static Inverse(node: Node) {
		return this.Exponentiation(node, this.NegativeOne());
	}

	static Negative(n: Node): Multiply {
		return {
			type: NodeType.Multiply,
			args: [n, this.NegativeOne()],
		};
	}

	static SquareRoot(node: Node) {
		return BasicNodes.Exponentiation(node, BasicNodes.Literal(ComplexUtils.FromNumbers(1, 2)));
	}

	static Square(node: Node) {
		return BasicNodes.Exponentiation(node, BasicNodes.Literal(2));
	}

	static OneI(): Literal {
		return BasicNodes.Literal(ComplexUtils.OneI());
	}

	static NegativeOne() {
		return BasicNodes.Literal(-1);
	}

	static One() {
		return BasicNodes.Literal(1);
	}

	static Zero() {
		return BasicNodes.Literal(0);
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
		return this.Literal(node) && ComplexUtils.Equal(node.number, ComplexUtils.Zero());
	}

	static One(node: Node) {
		return this.Literal(node) && ComplexUtils.Equal(node.number, ComplexUtils.One());
	}
}