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
import { Error, ErrorType } from "../Typescript/Error";
import { GammaFunction } from "../Math/FloatingPoint/Gamma";
import { Registry } from "../Registry";


export class Evaluator implements ASTVisitor<number> {
	constructor(private registry: Registry) {
	}

	Visit(node: Node): number {
		switch(node.type) {
			case NodeType.Literal:
				return this.VisitLiteral(node);
			case NodeType.Variable:
				return this.VisitVariable(node);
			case NodeType.Constant:
				return this.VisitConstant(node);
			case NodeType.Add:
				return this.VisitAdd(node);
			case NodeType.Multiply:
				return this.VisitMultiply(node);
			case NodeType.Exponentiation:
				return this.VisitExponentiation(node);
			case NodeType.Absolute:
				return this.VisitAbsolute(node);
			case NodeType.Factorial:
				return this.VisitFactorial(node);
			case NodeType.Function:
				return this.VisitFunction(node);
			case NodeType.Equals:
				return this.VisitEquals(node);
			case NodeType.List:
				return this.VisitList(node);
			case NodeType.Tensor:
				return this.VisitTensor(node);
		}
	}

	VisitLiteral(node: Literal): number {
		return node.number.real.numerator / node.number.real.denominator;
	}

	VisitVariable(node: Variable): number {
		const variable = this.registry.variables[node.string];
		if(!variable) {
			throw new Error(ErrorType.Evaluator, {
				message: "Unknown variable",
				variable: node.string,
				constants: this.registry.variables,
			});
		}
		return this.Visit(variable);
	}

	VisitConstant(node: Constant): number {
		const value = this.registry.constants[node.string];
		if(!value) {
			throw new Error(ErrorType.Evaluator, {
				message: "Unknown constant",
				variable: node.string,
				constants: this.registry.constants,
			});
		}
		return this.Visit(value);
	}

	VisitAdd(node: Add): number {
		return node.args.map(node => this.Visit(node)).reduce((a, b) => a + b);
	}

	VisitMultiply(node: Multiply): number {
		return node.args.map(node => this.Visit(node)).reduce((a, b) => a * b);
	}

	VisitExponentiation(node: Exponentiation): number {
		return math.pow(this.Visit(node.args[0]), this.Visit(node.args[1]));
	}

	VisitAbsolute(node: Absolute): number {
		return math.abs(this.Visit(node.args[0]));
	}

	VisitFactorial(node: Factorial): number {
		return GammaFunction.gamma(this.Visit(node.args[0]));
	}

	VisitFunction(node: Function): number {
		let func = this.registry.functions.find(fn => fn.names.includes(node.string));

		if(!func) {
			throw new Error(ErrorType.Evaluator, {
				message: "Unknown function",
				func: node.string,
				functions: this.registry.functions,
			});
		}

		return func.function(node.args.map(node => this.Visit(node)));
	}

	VisitEquals(node: Equals): number {
		throw new Error(ErrorType.Evaluator, {
			message: "Equality not supported",
			node: node,
		});
	}

	VisitList(node: List): number {
		throw new Error(ErrorType.Evaluator, {
			message: "Lists are not supported",
			node: node,
		});
	}

	VisitTensor(node: Tensor): number {
		throw new Error(ErrorType.Evaluator, {
			message: "Tensors are not supported",
			node: node,
		});
	}
}