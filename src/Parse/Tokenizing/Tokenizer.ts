import { Error, ErrorType } from "../../Typescript/Error";
import { Token, TokenType } from "../../Typescript/Parsing";

const TokenMap = new Map<string, (TokenType | "Whitespace")>([
	["%s", "Whitespace"],
	["%d+%.?%d*", TokenType.Literal],
	["%a+", TokenType.Identifier],
	[",", TokenType.Comma],
	["%(", TokenType.LeftParenthesis],
	["%)", TokenType.RightParenthesis],
	["%[", TokenType.LeftSquareBracket],
	["%]", TokenType.RightSquareBracket],
	["%+", TokenType.Add],
	["%-", TokenType.Subtract],
	["%*", TokenType.Multiply],
	["/", TokenType.Divide],
	["%^", TokenType.Exponentiation],
	["!", TokenType.Factorial],
	["{", TokenType.LeftCurlyBracket],
	["}", TokenType.RightCurlyBracket],
	["|", TokenType.Absolute],
]);

export class Tokenizer {
	private cursor: number;
	private input: string;

	constructor(input: string) {
		this.input = input;
		this.cursor = 0;
	}

	reset() {
		this.input = "";
		this.cursor = 0;
	}

	setInput(input: string) {
		this.input = input;
	}

	nextToken(): Token {
		if(!this.hasMoreTokens()) throw new Error(ErrorType.Tokenizer, {
			message: "Unexpected end of input",
		});

		for(const [match, type] of TokenMap) {
			const tokenValue = this.match(match);

			if(!tokenValue) continue;

			if(type === "Whitespace") continue;

			return {
				type,
				value: tokenValue,
				index: this.cursor,
			};
		}

		throw new Error(ErrorType.Tokenizer, {
			message: "Unknown token",
			currentlyProcessing: this.input.sub(this.cursor + 1),
		});
	}

	hasMoreTokens() {
		return this.cursor < this.input.size();
	}

	private match(match: string) {
		const result = this.input.match(`^(${match})`, this.cursor + 1);

		if(!result[0]) return;

		this.cursor += `${result[0]}`.size();
		return `${result[0]}`;
	}
}