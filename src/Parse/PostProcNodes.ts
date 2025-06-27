import {
	PostProcAbsolute,
	PostProcConstant,
	PostProcFactorial,
	PostProcFunction,
	PostProcLiteral,
	PostProcNode,
	PostProcTensor,
	PostProcType,
	PostProcUnary,
	PostProcVariable,
	Token,
} from "../Typescript/Parsing";

export class PostProc {
	static Literal(token: Token): PostProcLiteral {
		return {
			type: PostProcType.Literal,
			number: tonumber(token.value) as number,
		};
	}

	static Binary<T extends PostProcType>(nodeType: T, n1: PostProcNode, n2: PostProcNode): {
		type: T;
		args: [PostProcNode, PostProcNode];
	} {
		return {
			type: nodeType,
			args: [n1, n2],
		};
	}

	static Unary(node: PostProcNode): PostProcUnary {
		return {
			type: PostProcType.Unary,
			args: [node],
		};
	}

	static Factorial(node: PostProcNode): PostProcFactorial {
		return {
			type: PostProcType.Factorial,
			args: [node],
		};
	}

	static Function(func: string, args: PostProcNode[]): PostProcFunction {
		return {
			type: PostProcType.Function,
			string: func,
			args: args,
		};
	}

	static Variable(name: string): PostProcVariable {
		return {
			type: PostProcType.Variable,
			string: name,
		};
	}

	static Constant(name: string): PostProcConstant {
		return {
			type: PostProcType.Constant,
			string: name,
		};
	}

	static Absolute(node: PostProcNode): PostProcAbsolute {
		return {
			type: PostProcType.Absolute,
			args: [node],
		};
	}

	static Vector(args: PostProcNode[]): PostProcTensor {
		return {
			type: PostProcType.Tensor,
			args: args,
			shape: [args.size()],
		};
	}

	static Matrix(args: PostProcNode[], rows: number, cols: number): PostProcTensor {
		return {
			type: PostProcType.Tensor,
			args: args,
			shape: [rows, cols],
		};
	}

	static Tensor(args: PostProcNode[], shape: number[]): PostProcTensor {
		return {
			type: PostProcType.Tensor,
			args: args,
			shape: shape,
		};
	}
}