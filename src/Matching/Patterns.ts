import {NodeType} from "../Typescript/Node";
import {DetectionNode, Pattern, SpecialNode} from "../Typescript/Match";
import {Nodes} from "../Node/NodeUtils";

function specialNode(node: Pattern, special: SpecialNode): Pattern {
	return node.map(detectionNode => ({ ...detectionNode, specialNode: special }));
}

export class Functions {
	static Add(...nodes: Pattern[]): DetectionNode<NodeType.Add>[] {
		return [{
			type: NodeType.Add,
			args: nodes,
			commutative: true,
		}];
	}

	static Subtract(node1: Pattern, node2: Pattern): DetectionNode<NodeType.Add>[] {
		return this.Add(node1, this.Negative(node2));
	}

	static Multiply(...nodes: Pattern[]): DetectionNode<NodeType.Multiply>[] {
		return [{
			type: NodeType.Multiply,
			args: nodes,
			commutative: true,
		}];
	}

	static Divide(node1: Pattern, node2: Pattern): DetectionNode<NodeType.Multiply>[] {
		return this.Multiply(node1, this.Exponentiation(node2, Patterns.NegativeOne()));
	}

	static Exponentiation(node1: Pattern, node2: Pattern): DetectionNode<NodeType.Exponentiation>[] {
		return [{
			type: NodeType.Exponentiation,
			args: [node1, node2],
			commutative: false,
		}];
	}

	static Negative(node: Pattern): DetectionNode<NodeType.Multiply>[] {
		return this.Multiply(node, Patterns.NegativeOne());
	}
}

export class Patterns {
	static One(): DetectionNode<NodeType.Literal>[] {
		return [Nodes.One()];
	}

	static Zero(): DetectionNode<NodeType.Literal>[] {
		return [Nodes.Zero()];
	}

	static NegativeOne(): DetectionNode<NodeType.Literal>[] {
		return [Nodes.NegativeOne()];
	}

	static Wildcard(): DetectionNode[] {
		return [{}];
	}

	static Literal(): DetectionNode<NodeType.Literal>[] {
		return [{
			type: NodeType.Literal,
		}];
	}
}

export class SpecialNodes {
	static PFunction(node: Pattern) {
		return specialNode(node, SpecialNode.P);
	}

	static QFunction(node: Pattern) {
		return specialNode(node, SpecialNode.Q);
	}

	static RFunction(node: Pattern) {
		return specialNode(node, SpecialNode.R);
	}

	static SFunction(node: Pattern) {
		return specialNode(node, SpecialNode.S);
	}

	static P() {
		return this.PFunction(Patterns.Wildcard());
	}

	static Q() {
		return this.QFunction(Patterns.Wildcard());
	}

	static R() {
		return this.RFunction(Patterns.Wildcard());
	}

	static S() {
		return this.SFunction(Patterns.Wildcard());
	}
}