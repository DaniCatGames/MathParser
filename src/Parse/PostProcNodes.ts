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

export function postProcLiteral(token: Token): PostProcLiteral {
	return {
		type: PostProcType.Literal,
		number: tonumber(token.value) as number,
	};
}

export function postProcBinary<T extends PostProcType>(nodeType: T, n1: PostProcNode, n2: PostProcNode): {
	type: T;
	args: [PostProcNode, PostProcNode];
} {
	return {
		type: nodeType,
		args: [n1, n2],
	};
}

export function postProcUnary(node: PostProcNode): PostProcUnary {
	return {
		type: PostProcType.Unary,
		args: [node],
	};
}

export function postProcFactorial(node: PostProcNode): PostProcFactorial {
	return {
		type: PostProcType.Factorial,
		args: [node],
	};
}

export function postProcFunction(func: string, args: PostProcNode[]): PostProcFunction {
	return {
		type: PostProcType.Function,
		string: func,
		args: args,
	};
}

export function postProcVariable(name: string): PostProcVariable {
	return {
		type: PostProcType.Variable,
		string: name,
	};
}

export function postProcConstant(name: string): PostProcConstant {
	return {
		type: PostProcType.Constant,
		string: name,
	};
}

export function postProcAbsolute(node: PostProcNode): PostProcAbsolute {
	return {
		type: PostProcType.Absolute,
		args: [node],
	};
}

export function postProcVector(args: PostProcNode[]): PostProcTensor {
	return {
		type: PostProcType.Tensor,
		args: args,
		shape: [args.size()],
	};
}

export function postProcMatrix(args: PostProcNode[], rows: number, cols: number): PostProcTensor {
	return {
		type: PostProcType.Tensor,
		args: args,
		shape: [rows, cols],
	};
}

export function postProcTensor(args: PostProcNode[], shape: number[]): PostProcTensor {
	return {
		type: PostProcType.Tensor,
		args: args,
		shape: shape,
	};
}