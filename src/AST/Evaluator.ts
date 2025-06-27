import { Function } from "../Math/Symbolic/MathFunctions";
import { Node, NodeType } from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { GammaFunction } from "../Math/FloatingPoint/Gamma";

export class Evaluator {
	private readonly functions: Function[] = [];
	private readonly variables: { [key: string]: number } = {};
	private readonly constants: { [key: string]: number } = {};

	constructor() {
	}

	Numeric(node: Node): number {
		switch(node.type) {
			case NodeType.Literal:
				return node.number.real.numerator / node.number.real.denominator;
			case NodeType.Variable:
			case NodeType.Constant:
				const value = this.constants[node.string];
				if(!value) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown constant or variable",
						variable: node.string,
						constants: this.constants,
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
				let func = this.functions.find(fn => fn.names.includes(node.string));

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

	addVariable(variable: string, value: number) {
		this.variables[variable] = value;
	}

	addFunction(fn: Function) {
		const i = this.functions.indexOf(fn);
		i > -1 ? this.functions[i] = fn : this.functions.push(fn);
	}

	removeFunction(fn: string) {
		const func = this.functions.find(value => value.names.includes(fn));
		if(!func) return false;

		this.functions.remove(this.functions.indexOf(func));
		return true;
	}

	addConstant(constant: string, value: number) {
		this.constants[constant] = value;
	}
}