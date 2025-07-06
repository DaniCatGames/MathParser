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

export abstract class Visitor<T> implements ASTVisitor<T> {
	Visit(node: Node): T {
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

	abstract VisitLiteral(node: Literal): T

	abstract VisitVariable(node: Variable): T

	abstract VisitAdd(node: Add): T

	abstract VisitMultiply(node: Multiply): T

	abstract VisitExponentiation(node: Exponentiation): T

	abstract VisitAbsolute(node: Absolute): T

	abstract VisitEquals(node: Equals): T

	abstract VisitFunction(node: Function): T

	abstract VisitList(node: List): T

	abstract VisitFactorial(node: Factorial): T

	abstract VisitTensor(node: Tensor): T

	abstract VisitConstant(node: Constant): T
}