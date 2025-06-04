import { Function } from "../Math/Symbolic/MathFunctions";
import { Node, NodeType } from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { GammaFunction } from "../Math/FloatingPoint/Gamma";

export class Evaluator {
	private readonly functions: { [name: string]: Function } = {};
	private readonly variables: { [key: string]: number } = {};

	constructor(functions: { [name: string]: Function }, variables: { [key: string]: number }) {
		this.functions = functions;
		this.variables = variables;
	}

	Numeric(node: Node): number {
		switch(node.type) {
			case NodeType.Literal:
				return node.number.real.numerator / node.number.real.denominator;
			case NodeType.Constant:
				const value = this.variables[node.string];
				if(!value) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown constant",
						variable: node.string,
						variables: this.variables,
					});
				}
				return value;
			case NodeType.Absolute:
				return math.abs(this.Numeric(node.args[0]));
			case NodeType.Add:
				return node.args.map(node => this.Numeric(node)).reduce((a, b) => a + b);
			case NodeType.Factorial:
				return GammaFunction.gamma(this.Numeric(node.args[0]));
			case NodeType.Function:
				const func = this.functions[node.string];
				if(!func) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown function",
						func: node.string,
						functions: this.functions,
					});
				}
				return func.function(node.args.map(node => this.Numeric(node)));
			case NodeType.Exponentiation:
				return math.pow(this.Numeric(node.args[0]), this.Numeric(node.args[1]));
			case NodeType.Multiply:
				return node.args.map(node => this.Numeric(node)).reduce((a, b) => a * b);
			case NodeType.Variable:
				const variable = this.variables[node.string];
				if(!variable) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown variable",
						func: node.string,
						functions: this.variables,
					});
				}
				return variable;
			case NodeType.Equals:
				throw new Error(ErrorType.Evaluator, {
					message: "Equality not supported",
				});
			case NodeType.List:
			case NodeType.Tensor:
				throw new Error(ErrorType.Evaluator, {
					message: "Lists/Tensors not supported",
				});
		}
	}



	setVariable(variable: string, value: number): void {
		this.variables[variable] = value;
	}

	setFunction(name: string, func: Function): void {
		this.functions[name] = func;
	}
}