import {
	Absolute,
	Add,
	ASTVisitor,
	Constant,
	Equals,
	Exponentiation,
	Factorial,
	Function,
	List,
	Literal,
	Multiply,
	Node,
	NodeType,
	Tensor,
	Variable
} from "../Typescript/Node";
import { Nodes, NodeTests } from "./NodeUtils";

export abstract class BaseASTVisitor implements ASTVisitor {
	Visit(node: Node): Node {
		switch(node.type) {
			case NodeType.Literal:
				return this.VisitLiteral(node);
			case NodeType.Variable:
				return this.VisitVariable(node);
			case NodeType.Add:
				return this.VisitAdd(node);
			case NodeType.Multiply:
				return this.VisitMultiply(node);
			case NodeType.Exponentiation:
				return this.VisitExponentiation(node);
			case NodeType.Absolute:
				return this.VisitAbsolute(node);
			case NodeType.Equals:
				return this.VisitEquals(node);
			case NodeType.Function:
				return this.VisitFunction(node);
			case NodeType.List:
				return this.VisitList(node);
			case NodeType.Factorial:
				return this.VisitFactorial(node);
			case NodeType.Tensor:
				return this.VisitTensor(node);
			case NodeType.Constant:
				return this.VisitConstant(node);
		}
	}

	VisitLiteral(node: Literal): Node {
		return node;
	}

	VisitVariable(node: Variable): Node {
		return node;
	}

	VisitAdd(node: Add): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitMultiply(node: Multiply): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitExponentiation(node: Exponentiation): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitAbsolute(node: Absolute): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitEquals(node: Equals): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitFunction(node: Function): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitList(node: List): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitFactorial(node: Factorial): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitTensor(node: Tensor): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg))
		};
	}

	VisitConstant(node: Constant): Node {
		return node;
	}
}

export class FlatteningVisitor extends BaseASTVisitor {
	constructor() {
		super();
	}

	VisitAdd(node: Add): Node {
		const nodes: Node[] = [];

		node.args.forEach(arg => {
			arg = this.Visit(arg);

			if(NodeTests.Add(arg)) {
				arg.args.forEach(arg => nodes.push(arg));
			} else {
				nodes.push(arg);
			}
		});

		return Nodes.Add(...nodes);
	}

	VisitMultiply(node: Multiply): Node {
		const nodes: Node[] = [];

		node.args.forEach(arg => {
			arg = this.Visit(arg);

			if(NodeTests.Add(arg)) {
				arg.args.forEach(arg => nodes.push(arg));
			} else {
				nodes.push(arg);
			}
		});

		return Nodes.Multiply(...nodes);
	}
}

export class EvaluatorVisitor extends BaseASTVisitor {
	VisitLiteral(node: Literal): Node {
		return super.VisitLiteral(node);
	}

	VisitVariable(node: Variable): Node {
		return super.VisitVariable(node);
	}

	VisitAdd(node: Add): Node {
		return super.VisitAdd(node);
	}

	VisitMultiply(node: Multiply): Node {
		return super.VisitMultiply(node);
	}

	VisitExponentiation(node: Exponentiation): Node {
		return super.VisitExponentiation(node);
	}

	VisitAbsolute(node: Absolute): Node {
		return super.VisitAbsolute(node);
	}

	VisitEquals(node: Equals): Node {
		return super.VisitEquals(node);
	}

	VisitFunction(node: Function): Node {
		return super.VisitFunction(node);
	}

	VisitList(node: List): Node {
		return super.VisitList(node);
	}

	VisitFactorial(node: Factorial): Node {
		return super.VisitFactorial(node);
	}

	VisitTensor(node: Tensor): Node {
		return super.VisitTensor(node);
	}

	VisitConstant(node: Constant): Node {
		return super.VisitConstant(node);
	}
}