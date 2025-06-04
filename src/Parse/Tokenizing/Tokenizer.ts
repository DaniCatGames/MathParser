import { Error, ErrorType } from "../../Typescript/Error";
import { MathFunctions, PostProcessorFunctions } from "../../Math/Symbolic/MathFunctions";
import { ExtendedMath } from "../../Math/FloatingPoint/ExtendedMath";
import { ParserConfig } from "../Parser";
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
	private config: ParserConfig;
	functions = new Set<string>();
	constants = new Set<string>();

	constructor(input: string, config: ParserConfig) {
		this.input = input;
		this.cursor = 0;
		this.config = config;

		this.collectConstants();
		this.collectFunctions();
	}

	reset() {
		this.input = "";
		this.cursor = 0;
	}

	setInput(input: string) {
		this.input = input;
	}

	nextToken(): Token {
		if(!this.hasMoreTokens()) throw new Error(ErrorType.UnexpectedEndOfInput, {});

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

		throw new Error(ErrorType.UnknownToken, {
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

	private collectFunctions() {
		this.functions.clear();

		for(const [key, _] of pairs(MathFunctions)) {
			this.functions.add(key as string);
		}
		for(const [key, _] of pairs(PostProcessorFunctions)) {
			this.functions.add(key as string);
		}

		this.config.extraFunctions.forEach(func => this.functions.add(func));
	}

	private collectConstants() {
		this.constants.clear();

		for(const [key, _] of pairs(ExtendedMath.constants)) {
			this.constants.add(key as string);
		}

		this.config.extraConstants.forEach(func => this.constants.add(func));
	}
}