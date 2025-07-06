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
	Left = "Left",
	Right = "Right"
}

export interface GrammarRule {
	name: string;
	description: string;
	enabled: boolean;
	priority: number;

	canStartWith(token: Token, parser: ParserContext): boolean;

	getPrecedence?(token: Token): number;

	prefix?(parser: Parser): Node;

	mixfix?(parser: Parser, left: Node): Node;
}

export interface ParserContext {
	Eat(tokenType?: TokenType, errorMessage?: string): Token;

	Peek(): Token;

	Expression(precedence?: number): Node;

	HasMoreTokens(): boolean;

	ParseList(startType: TokenType, endType: TokenType, separator: TokenType): Node[];

	IsFunction(name: string): boolean;

	FindFunction(name: string): Function | undefined;

	IsConstant(name: string): boolean;

	GetPrecedence(token: Token | "unary"): number;
}

export interface BinaryOperator {
	tokenType: TokenType;
	precedence: number;
	associativity?: Associativity;
	creator: (left: Node, right: Node) => Node;
}