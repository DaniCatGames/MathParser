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
	NodeType,
	Tensor,
	Variable,
} from "../Typescript/Node";
import { Complex } from "../Typescript/Math";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export class BasicNodes {
	static Literal(value: number | Complex): Literal {
		if(typeIs(value, "number")) {
			return {
				type: NodeType.Literal,
				number: ComplexUtils.FromNumber(value),
			};
		} else {
			return {
				type: NodeType.Literal,
				number: value,
			};
		}
	}

	static Variable(variable: string): Variable {
		return {
			type: NodeType.Variable,
			string: variable,
		};
	}

	static Constant(variable: string): Constant {
		return {
			type: NodeType.Constant,
			string: variable,
		};
	}

	static Multiply(...nodes: Node[]): Multiply {
		return {
			type: NodeType.Multiply,
			args: nodes,
		};
	}

	static Add(...nodes: Node[]): Add {
		return {
			type: NodeType.Add,
			args: nodes,
		};
	}

	static Exponentiation(n1: Node, n2: Node): Exponentiation {
		return {
			type: NodeType.Exponentiation,
			args: [n1, n2],
		};
	}

	static Function(func: string, ...args: Node[]): Function {
		return {
			type: NodeType.Function,
			string: func,
			args: args,
		};
	}

	static Equals(n1: Node, n2: Node): Equals {
		return {
			type: NodeType.Equals,
			args: [n1, n2],
		};
	}

	static Absolute(n: Node): Absolute {
		return {
			type: NodeType.Absolute,
			args: [n],
		};
	}

	static Factorial(n: Node): Factorial {
		return {
			type: NodeType.Factorial,
			args: [n],
		};
	}

	static List(...args: Node[]): List {
		return {
			type: NodeType.List,
			args: args,
		};
	}

	static Vector(...args: Node[]): Tensor {
		return {
			type: NodeType.Tensor,
			args: args,
			shape: [args.size()],
		};
	}

	static Matrix(args: Node[], rows: number, cols: number): Tensor {
		return {
			type: NodeType.Tensor,
			args: args,
			shape: [rows, cols],
		};
	}

	static Tensor(args: Node[], shape: number[]): Tensor {
		return {
			type: NodeType.Tensor,
			args: args,
			shape: shape,
		};
	}
}