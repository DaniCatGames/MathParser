export enum PostProcType {
	Literal,
	Add,
	Subtract,
	Divide,
	Multiply,
	Exponentiation,
	Unary,
	Factorial,
	Function,
	Variable,
	List,
	Absolute,
	Tensor,
	Constant
}

export enum TokenType {
	Literal,
	Identifier,
	Comma,
	LeftParenthesis,
	RightParenthesis,
	Absolute,
	LeftSquareBracket,
	RightSquareBracket,
	Add,
	Subtract,
	Multiply,
	Divide,
	Exponentiation,
	Factorial,
	LeftCurlyBracket,
	RightCurlyBracket,
}

export interface Token {
	type: TokenType;
	value: string;
	index: number;
}

export interface PostProcLiteral {
	type: PostProcType.Literal;
	number: number;
}

export interface PostProcUnary {
	type: PostProcType.Unary;
	args: [PostProcNode];
}

export interface PostProcVariable {
	type: PostProcType.Variable;
	string: string;
}

export interface PostProcBinary {
	type: PostProcType.Add | PostProcType.Subtract | PostProcType.Multiply | PostProcType.Divide | PostProcType.Exponentiation;
	args: [PostProcNode, PostProcNode];
}

export interface PostProcFunction {
	type: PostProcType.Function;
	string: string;
	args: PostProcNode[];
}

export interface PostProcList {
	type: PostProcType.List;
	args: PostProcNode[];
}

export interface PostProcFactorial {
	type: PostProcType.Factorial;
	args: [PostProcNode];
}

export interface PostProcAbsolute {
	type: PostProcType.Absolute;
	args: [PostProcNode];
}

export interface PostProcTensor {
	type: PostProcType.Tensor;
	args: PostProcNode[];
	shape: number[];
}

export interface PostProcConstant {
	type: PostProcType.Constant;
	string: string;
}

export type PostProcNode =
	PostProcLiteral
	| PostProcBinary
	| PostProcUnary
	| PostProcFunction
	| PostProcVariable
	| PostProcList
	| PostProcFactorial
	| PostProcAbsolute
	| PostProcTensor
	| PostProcConstant