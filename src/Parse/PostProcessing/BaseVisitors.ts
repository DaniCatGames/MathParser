import {
	PostProcAbsolute,
	PostProcBinary,
	PostProcConstant,
	PostProcFactorial,
	PostProcFunction,
	PostProcList,
	PostProcLiteral,
	PostProcNode,
	PostProcTensor,
	PostProcType,
	PostProcUnary,
	PostProcVariable,
} from "../../Typescript/Parsing";
import { Node } from "../../Typescript/Node";
import { BasicNodes } from "../../Node/BasicNodes";

export class PostProcVisitor {
	Visit(node: PostProcNode): Node {
		switch(node.type) {
			case PostProcType.Literal:
				return this.VisitLiteral(node);
			case PostProcType.Variable:
				return this.VisitVariable(node);
			case PostProcType.Constant:
				return this.VisitConstant(node);
			case PostProcType.Add:
			case PostProcType.Subtract:
			case PostProcType.Multiply:
			case PostProcType.Divide:
			case PostProcType.Exponentiation:
				return this.VisitBinary(node);
			case PostProcType.Unary:
				return this.VisitUnary(node);
			case PostProcType.Function:
				return this.VisitFunction(node);
			case PostProcType.List:
				return this.VisitList(node);
			case PostProcType.Tensor:
				return this.VisitTensor(node);
			case PostProcType.Absolute:
				return this.VisitAbsolute(node);
			case PostProcType.Factorial:
				return this.VisitFactorial(node);
		}
	}

	VisitLiteral(node: PostProcLiteral): Node {
		return BasicNodes.Literal(node.number);
	}

	VisitVariable(node: PostProcVariable): Node {
		return BasicNodes.Variable(node.string);
	}

	VisitConstant(node: PostProcConstant): Node {
		return BasicNodes.Constant(node.string);
	}

	VisitBinary(node: PostProcBinary): Node {
		const left = this.Visit(node.args[0]);
		const right = this.Visit(node.args[1]);

		switch(node.type) {
			case PostProcType.Add:
				return BasicNodes.Add(left, right);
			case PostProcType.Subtract:
				return BasicNodes.Subtract(left, right);
			case PostProcType.Multiply:
				return BasicNodes.Multiply(left, right);
			case PostProcType.Divide:
				return BasicNodes.Divide(left, right);
			case PostProcType.Exponentiation:
				return BasicNodes.Exponentiation(left, right);
		}
	}

	VisitUnary(node: PostProcUnary): Node {
		return BasicNodes.Negative(this.Visit(node.args[0]));
	}

	VisitFunction(node: PostProcFunction): Node {
		const args = node.args.map(arg => this.Visit(arg));
		return BasicNodes.Function(node.string, ...args);
	}

	VisitList(node: PostProcList): Node {
		const args = node.args.map(arg => this.Visit(arg));
		return BasicNodes.List(...args);
	}

	VisitTensor(node: PostProcTensor): Node {
		const args = node.args.map(arg => this.Visit(arg));
		return BasicNodes.Tensor(args, node.shape);
	}

	VisitAbsolute(node: PostProcAbsolute): Node {
		return BasicNodes.Absolute(this.Visit(node.args[0]));
	}

	VisitFactorial(node: PostProcFactorial): Node {
		return BasicNodes.Factorial(this.Visit(node.args[0]));
	}
}

