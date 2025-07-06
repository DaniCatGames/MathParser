import { Visitor } from "./Visitor";
import {
	Absolute,
	Add,
	Constant,
	Equals,
	Exponentiation,
	Factorial,
	Function,
	List,
	Literal,
	Multiply,
	Node,
	Tensor,
	Variable,
} from "../Typescript/Node";

export class NodeVisitor extends Visitor<Node> {
	constructor() {
		super();
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
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitMultiply(node: Multiply): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitExponentiation(node: Exponentiation): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitAbsolute(node: Absolute): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitEquals(node: Equals): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitFunction(node: Function): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitList(node: List): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitFactorial(node: Factorial): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitTensor(node: Tensor): Node {
		return {
			...node,
			args: node.args.map(arg => this.Visit(arg)),
		};
	}

	VisitConstant(node: Constant): Node {
		return node;
	}
}