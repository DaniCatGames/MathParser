import { Registry } from "../Registry";
import {
	Absolute,
	Add,
	Constant,
	Exponentiation,
	Factorial,
	Function,
	Literal,
	Multiply,
	Node,
	Tensor,
	Variable,
} from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { NodeTests } from "../Node/NodeUtils";
import { TensorUtils } from "../Math/Symbolic/Tensor";
import { NodeVisitor } from "./Base";

export class FunctionValidator extends NodeVisitor {
	constructor(private registry: Registry) {
		super();
	}

	VisitFunction(node: Function): Node {
		const fn = this.registry.functions.find((func) => func.names.some((name) => name === node.string));

		if(!fn)
			throw new Error(ErrorType.Parser, {
				message: "Function not found",
				node: node,
			});

		if(fn.arguments !== node.args.size()) throw new Error(ErrorType.Parser, {
			message: `Function ${node.string} must have ${fn.arguments} arguments`,
			node: node,
			expected: fn.arguments,
			actual: node.args.size(),
		});

		return super.VisitFunction(node);
	}
}

export class TensorValidator extends NodeVisitor {
	constructor() {
		super();
	}

	VisitTensor(node: Tensor): Node {
		if(!TensorUtils.ValidateTensorShape(node.args, node.shape)) {
			throw new Error(ErrorType.Parser, {
				message: "Tensor shape is invalid",
				node: node,
			});
		}

		return super.VisitTensor(node);
	}
}

export class LeafValidator extends NodeVisitor {
	constructor(private registry: Registry) {
		super();
	}

	VisitVariable(node: Variable): Node {
		if(node.string.size() === 0) {
			throw new Error(ErrorType.Parser, {
				message: "Variable name cannot be empty",
				node: node,
			});
		}

		return super.VisitVariable(node);
	}

	VisitConstant(node: Constant): Node {
		if(node.string.size() === 0) {
			throw new Error(ErrorType.Parser, {
				message: "Constant name cannot be empty",
				node: node,
			});
		}

		let has = false;
		for(const [name, _] of pairs(this.registry.constants)) {
			if(name === node.string) has = true;
		}
		if(!has) throw new Error(ErrorType.Parser, {
			message: "Constant not found",
			node: node,
		});

		return super.VisitConstant(node);
	}

	VisitLiteral(node: Literal): Node {
		if(node.number.real.denominator === 0 || node.number.imaginary.denominator === 0) {
			throw new Error(ErrorType.Parser, {
				message: "Literal cannot have a zero denominator",
				node: node,
			});
		}

		return super.VisitLiteral(node);
	}
}

export class OperatorValidator extends NodeVisitor {
	constructor() {
		super();
	}

	VisitAdd(node: Add): Node {
		if(node.args.size() < 2) {
			throw new Error(ErrorType.Parser, {
				message: "Add function must have at least two arguments",
				node: node,
			});
		}

		return super.VisitAdd(node);
	}

	VisitMultiply(node: Multiply): Node {
		if(node.args.size() < 2) {
			throw new Error(ErrorType.Parser, {
				message: "Multiply function must have at least two arguments",
				node: node,
			});
		}

		return super.VisitMultiply(node);
	}

	VisitAbsolute(node: Absolute): Node {
		if(node.args.size() !== 1) {
			throw new Error(ErrorType.Parser, {
				message: "Absolute function must have exactly one argument",
				node: node,
			});
		}

		return super.VisitAbsolute(node);
	}

	VisitExponentiation(node: Exponentiation): Node {
		if(node.args.size() !== 2) {
			throw new Error(ErrorType.Parser, {
				message: "Exponentiation function must have exactly two arguments",
				node: node,
			});
		}

		if(NodeTests.Zero(node.args[1])) throw new Error(ErrorType.Parser, {
			message: "Exponentiation must have a non-zero exponent",
			node: node,
		});

		if(NodeTests.Zero(node.args[0]) && NodeTests.Literal(node.args[1])
			&& node.args[1].number.real.numerator < 0 && node.args[1].number.imaginary.numerator === 0)
			throw new Error(ErrorType.Parser, {
				message: "Dividing by zero is not possible",
				node: node,
			});

		return super.VisitExponentiation(node);
	}

	VisitFactorial(node: Factorial): Node {
		if(node.args.size() !== 1) {
			throw new Error(ErrorType.Parser, {
				message: "Factorial function must have exactly one argument",
				node: node,
			});
		}

		return super.VisitFactorial(node);
	}
}