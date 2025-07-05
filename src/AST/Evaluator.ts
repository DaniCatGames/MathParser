import { Node, NodeType } from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { GammaFunction } from "../Math/FloatingPoint/Gamma";
import { Registry } from "../Registry";

export class Evaluator {
	constructor(private registry: Registry) {
	}

	Numeric(node: Node): number {
		switch(node.type) {
			case NodeType.Literal:
				return node.number.real.numerator / node.number.real.denominator;
			case NodeType.Variable:
				const variable = this.registry.variables[node.string];
				if(!variable) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown variable",
						variable: node.string,
						constants: this.registry.variables,
					});
				}
				return this.Numeric(variable);
			case NodeType.Constant:
				const value = this.registry.constants[node.string];
				if(!value) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown constant",
						variable: node.string,
						constants: this.registry.constants,
					});
				}
				return this.Numeric(value);
			case NodeType.Absolute:
				return math.abs(this.Numeric(node.args[0]));
			case NodeType.Add:
				return node.args.map(node => this.Numeric(node)).reduce((a, b) => a + b);
			case NodeType.Factorial:
				return GammaFunction.gamma(this.Numeric(node.args[0]));
			case NodeType.Function:
				let func = this.registry.functions.find(fn => fn.names.includes(node.string));

				if(!func) {
					throw new Error(ErrorType.Evaluator, {
						message: "Unknown function",
						func: node.string,
						functions: this.registry.functions,
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
}