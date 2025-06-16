import {
	Absolute,
	Add,
	Exponentiation,
	Factorial,
	Function,
	List,
	Multiply,
	Node,
	NodeType,
	Tensor,
	Variable,
} from "../Typescript/Node";
import { MathFunctions } from "../Math/Symbolic/MathFunctions";
import { Error, ErrorType } from "../Typescript/Error";
import { BasicNodes } from "../Node/BasicNodes";
import { NodeUtils } from "../Node/NodeUtils";
import { Evaluator } from "../Solving/Evaluator";
import { Polynomial, PolynomialTerm } from "../Typescript/Polynomials";
import { PolynomialAnalyzer } from "./PolynomialAnalyzer";


export class Calculus {
	static derivative(node: Node, variable: string = "x"): Node {
		switch(node.type) {
			case NodeType.Literal:
				return this.literal();
			case NodeType.Variable:
				return this.variable(node, variable);
			case NodeType.Add:
				return this.add(node, variable);
			case NodeType.Multiply:
				return this.multiply(node, variable);
			case NodeType.Exponentiation:
				return this.exponentiation(node, variable);
			case NodeType.Absolute:
				return this.absolute(node, variable);
			case NodeType.Function:
				return this.func(node, variable);
			case NodeType.Factorial:
				return this.factorial(node, variable);
			case NodeType.List:
				return this.list(node, variable);
			case NodeType.Tensor:
				return this.tensor(node, variable);
			case NodeType.Equals:
				throw new Error(ErrorType.InvalidNodeType, {
					message: "Cannot take derivative of equality operator",
					node: node,
				});
		}
	}

	static numericDerivative(node: Node, variable: string, at: number) {
		const evaluator = new Evaluator(MathFunctions, {});
		const h = 1e-7;

		evaluator.setVariable(variable, at + h);
		const a = evaluator.Numeric(node);

		evaluator.setVariable(variable, at + h);
		const b = evaluator.Numeric(node);

		return (a - b) / h;
	}

	static integral(polynomial: Polynomial, variable: string) {
		const newIntegralTerms: PolynomialTerm[] = [];

		polynomial.terms.forEach(term => {
			const power = term.variables.get(variable) || 0;
			const newPower = power + 1;

			const newVariables = new Map<string, number>();
			for(const [k, v] of term.variables) {
				newVariables.set(k, v);
			}
			newVariables.set(variable, newPower);

			const newCoeff = BasicNodes.Divide(
				term.coefficient,
				BasicNodes.Literal(newPower),
			);

			newIntegralTerms.push({
				coefficient: newCoeff,
				variables: newVariables,
				degree: term.degree + 1,
			});
		});

		return PolynomialAnalyzer.createPolynomial(newIntegralTerms);
	}

	static numericIntegral(node: Node) {

	}


	private static literal() {
		return BasicNodes.Zero();
	}

	private static constant() {
		return BasicNodes.Zero();
	}

	private static variable(node: Variable, variable: string) {
		if(node.string === variable) {
			return BasicNodes.One();
		} else {
			return BasicNodes.Zero();
		}
	}

	private static add(node: Add, variable: string) {
		const args = node.args.map(arg => this.derivative(arg, variable));
		const nonZeroArgs = args.filter(arg => !this.isZero(arg));

		if(nonZeroArgs.size() === 0) {
			return BasicNodes.Zero();
		} else if(nonZeroArgs.size() === 1) {
			return nonZeroArgs[0];
		} else {
			return BasicNodes.Add(...nonZeroArgs);
		}
	}

	private static multiply(node: Multiply, variable: string) {
		if(node.args.size() === 0) {
			return BasicNodes.Zero();
		} else if(node.args.size() === 1) {
			return this.derivative(node.args[0], variable);
		}

		const returnArgs: Node[] = [];

		for(let i = 0; i < node.args.size(); i++) {
			for(let j = 0; j < node.args.size(); j++) {
				if(i === j) {
					returnArgs.push(this.derivative(node.args[i], variable));
				} else {
					returnArgs.push(node.args[j]);
				}
			}
		}

		if(returnArgs.size() === 0) {
			return BasicNodes.Zero();
		} else if(returnArgs.size() === 1) {
			return returnArgs[0];
		} else {
			return BasicNodes.Add(...returnArgs);
		}
	}

	private static exponentiation(node: Exponentiation, variable: string) {
		const [base, exp] = node.args;

		const baseDerivative = this.derivative(base, variable);
		const expDerivative = this.derivative(exp, variable);

		if(this.isZero(baseDerivative) && this.isZero(expDerivative)) {
			return BasicNodes.Zero();
		}

		if(this.isZero(expDerivative)) {
			return BasicNodes.Multiply(
				exp,
				baseDerivative,
				BasicNodes.Exponentiation(base, BasicNodes.Add(exp, BasicNodes.NegativeOne())),
			);
		}

		return BasicNodes.Multiply(
			BasicNodes.Exponentiation(base, exp),
			BasicNodes.Add(
				BasicNodes.Multiply(
					baseDerivative,
					BasicNodes.Divide(exp, base),
				),
				BasicNodes.Multiply(
					expDerivative,
					BasicNodes.Function("ln", base),
				),
			),
		);
	}

	private static absolute(node: Absolute, variable: string) {
		const arg = node.args[0];
		const argDerivative = this.derivative(arg, variable);

		if(this.isZero(argDerivative)) {
			return BasicNodes.Zero();
		}

		return BasicNodes.Multiply(
			BasicNodes.Divide(arg, node),
			argDerivative,
		);
	};

	private static func(node: Function, variable: string) {
		if(node.args.size() === 0) {
			return BasicNodes.Zero();
		}

		if(node.args.size() === 1) {
			const arg = node.args[0];
			const argDerivative = this.derivative(arg, variable);

			if(this.isZero(argDerivative)) {
				return BasicNodes.Zero();
			}

			const mathFunction = MathFunctions[node.string];
			if(!mathFunction) {
				throw new Error(ErrorType.Derivative, {
					message: "Function not found or implemented",
					function: node.string,
				});
			}

			return BasicNodes.Multiply(mathFunction.derivative([arg]), argDerivative);
		}

		throw new Error(ErrorType.InvalidNodeType, {
			message: "Multi-argument function derivatives not implemented",
			function: node.string,
			args: node.args.size(),
		});
	}

	private static factorial(node: Factorial, variable: string): Node {
		throw new Error(ErrorType.InvalidNodeType, {
			message: "Factorial derivative not implemented",
		});
	}

	private static list(node: List, variable: string): Node {
		const derivativeArgs = node.args.map(arg => this.derivative(arg, variable));

		return BasicNodes.List(...derivativeArgs);
	}

	private static tensor(node: Tensor, variable: string): Node {
		const args = node.args.map(element => this.derivative(element, variable));

		return BasicNodes.Tensor(args, node.shape);
	}

	private static isZero(node: Node) {
		return node.type === NodeType.Literal
			&& NodeUtils.equal(node, BasicNodes.Zero());
	}
}