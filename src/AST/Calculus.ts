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
	Variable
} from "../Typescript/Node";
import { ExtraFunctionTypeBecauseOfStupidImports, MathFunctions } from "../Math/Symbolic/MathFunctions";
import { Error, ErrorType } from "../Typescript/Error";
import { BasicNodes } from "../Node/BasicNodes";
import { Nodes } from "../Node/NodeUtils";
import { Evaluator } from "./Evaluator";
import { BaseASTVisitor } from "../Node/Visitors";

export function NumericDerivative(node: Node, variable: string, at: number) {
	const evaluator = new Evaluator();
	MathFunctions.forEach(fn => evaluator.addFunction(fn));

	const h = 1e-7;

	evaluator.addVariable(variable, at + h);
	const a = evaluator.Numeric(node);

	evaluator.addVariable(variable, at + h);
	const b = evaluator.Numeric(node);

	return (a - b) / h;
}

export class Derivative extends BaseASTVisitor {
	private variable: string = "x";

	constructor(variable?: string) {
		super();
		if(variable) {
			this.variable = variable;
		}
	}

	SetVariable(variable: string) {
		this.variable = variable;
		return this;
	}

	VisitLiteral(node: Literal): Node {
		return Nodes.Zero();
	}

	VisitConstant(node: Constant): Node {
		return Nodes.Zero();
	}

	VisitVariable(node: Variable): Node {
		if(node.string === this.variable) {
			return Nodes.One();
		} else {
			return this.Visit(node);
		}
	}

	VisitAdd(node: Add): Node {
		const args = node.args.map(arg => this.Visit(arg));
		return Nodes.Add(...args);
	}

	VisitMultiply(node: Multiply): Node {
		if(node.args.size() === 0) {
			return Nodes.Zero();
		} else if(node.args.size() === 1) {
			return this.Visit(node.args[0]);
		}

		const args: Node[] = [];

		for(let i = 0; i < node.args.size(); i++) {
			const mulArgs: Node[] = [];
			for(let j = 0; j < node.args.size(); j++) {
				if(i === j) {
					mulArgs.push(this.Visit(node.args[i]));
				} else {
					mulArgs.push(node.args[j]);
				}
			}
			args.push(Nodes.Multiply(...mulArgs));
		}

		return Nodes.Add(...args);
	}

	VisitExponentiation(node: Exponentiation): Node {
		const [base, exp] = node.args;

		const baseDerivative = this.Visit(base);
		const expDerivative = this.Visit(exp);

		return Nodes.Multiply(
			Nodes.Exponentiation(base, exp),
			Nodes.Add(
				Nodes.Multiply(
					baseDerivative,
					Nodes.Divide(exp, base)
				),
				Nodes.Multiply(
					expDerivative,
					BasicNodes.Function("ln", base)
				)
			)
		);
	}

	VisitAbsolute(node: Absolute): Node {
		return Nodes.Multiply(
			Nodes.Divide(node.args[0], node),
			this.Visit(node.args[0])
		);
	}

	VisitFunction(node: Function): Node {
		const argDerivative = this.Visit(node.args[0]);

		let mathFunction: ExtraFunctionTypeBecauseOfStupidImports | undefined;

		mathFunction = MathFunctions.find(fn => fn.names.includes(node.string)); //TODO add custom functions to this check

		if(!mathFunction) {
			throw new Error(ErrorType.Derivative, {
				message: "Function not found",
				function: node.string
			});
		}

		return Nodes.Multiply(mathFunction.derivative(node.args), argDerivative);
	}

	VisitFactorial(node: Factorial): Node {
		throw new Error(ErrorType.Derivative, {
			message: "Factorial derivative not implemented"
		});
	}

	VisitList(node: List): Node {
		return BasicNodes.List(...node.args.map(arg => this.Visit(arg)));
	}

	VisitTensor(node: Tensor): Node {
		return BasicNodes.Tensor(node.args.map(arg => this.Visit(arg)), node.shape);
	}

	VisitEquals(node: Equals): Node {
		throw new Error(ErrorType.Derivative, {
			message: "Equals derivative not implemented"
		});
	}
}