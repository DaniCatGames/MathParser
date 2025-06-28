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