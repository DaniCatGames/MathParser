import { Node } from "./Node";
import { Parser } from "../Parse/Parser";
import { Function } from "../Math/Symbolic/MathFunctions";

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

export enum Associativity {
	Left,
	Right
}

export interface GrammarRule {
	name: string;
	description: string;
	enabled: boolean;
	priority: number;

	canStartWith(token: Token, parser: ParserContext): boolean;

	getPrecedence?(token: Token): number;

	getAssociativity?(token: Token): Associativity;

	prefix?(parser: Parser): Node;

	mixfix?(parser: Parser, left: Node): Node;
}

export interface ParserContext {
	eat(tokenType?: TokenType, errorMessage?: string): Token;

	peek(): Token;

	expression(precedence?: number): Node;

	hasMoreTokens(): boolean;

	parseList(startType: TokenType, endType: TokenType, separator: TokenType): Node[];

	isFunction(name: string): boolean;

	findFunction(name: string): Function | undefined;

	isConstant(name: string): boolean;

	getPrecedence(token: Token | "unary"): number;
}