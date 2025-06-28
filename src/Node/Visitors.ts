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
	Variable,
} from "../Typescript/Node";


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
		return node;
	}

	VisitMultiply(node: Multiply): Node {
		return node;
	}

	VisitExponentiation(node: Exponentiation): Node {
		return node;
	}

	VisitAbsolute(node: Absolute): Node {
		return node;
	}

	VisitEquals(node: Equals): Node {
		return node;
	}

	VisitFunction(node: Function): Node {
		return node;
	}

	VisitList(node: List): Node {
		return node;
	}

	VisitFactorial(node: Factorial): Node {
		return node;
	}

	VisitTensor(node: Tensor): Node {
		return node;
	}

	VisitConstant(node: Constant): Node {
		return node;
	}
}

export class FlatteningVisitor extends BaseASTVisitor {
	constructor() {
		super();
	}

	//TODO: implement flattening
}