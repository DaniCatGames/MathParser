import { Error, ErrorType } from "../../Typescript/Error";
import { Tokenizer } from "./Tokenizer";
import { RLEagerTokenizer } from "./RLEagerTokenizer";
import { ParserConfig } from "../Parser";
import { Token, TokenType } from "../../Typescript/Parsing";

export class TokenStream {
	private tokens: Token[] = [];
	private cursor: number = 0;
	private tokenizer: Tokenizer;
	functions = new Set<string>();
	constants = new Set<string>();

	constructor(input: string | Token[], config: ParserConfig) {
		this.tokenizer = new Tokenizer("", config);

		this.functions = this.tokenizer.functions;
		this.constants = this.tokenizer.constants;

		this.tokenize(input);
	}

	tokenize(input: string | Token[]) {
		this.processInput(input);
		this.RLEagerTokenize();
		this.implicitMultiplication();
	}

	nextToken() {
		if(!this.hasMoreTokens()) throw new Error(ErrorType.UnexpectedEndOfInput, {});

		const token = this.tokens[this.cursor];
		this.cursor++;
		return token;
	}

	hasMoreTokens() {
		return this.cursor < this.tokens.size();
	}

	reset() {
		this.tokens = [];
		this.cursor = 0;
	}

	private processInput(input: string | Token[]) {
		if(typeIs(input, "string")) {
			this.tokenizer.reset();
			this.tokenizer.setInput(input);

			while(this.tokenizer.hasMoreTokens()) {
				this.tokens.push(this.tokenizer.nextToken());
			}
		} else {
			this.tokens = input;
		}
	}

	private RLEagerTokenize() {
		const eagerTokenized: Token[] = [];
		this.tokens.forEach(token => {
			if(token.type === TokenType.Identifier) {
				const replacement = RLEagerTokenizer(token, this.constants, this.functions);
				replacement.forEach(replacementToken => {
					eagerTokenized.push(replacementToken);
				});
			} else {
				eagerTokenized.push(token);
			}
		});
		this.tokens = eagerTokenized;
	}

	private implicitMultiplication() {
		const result: Token[] = [];

		for(let i = 0; i < this.tokens.size(); i++) {
			const current = this.tokens[i];
			const nextToken = this.tokens[i + 1];

			result.push(current);

			if(!nextToken) break;

			if(shouldInsertMultiplication(current, nextToken, this.functions)) {
				result.push({
					type: TokenType.Multiply,
					value: "*",
					index: current.index + current.value.size(),
				});
			}
		}

		this.tokens = result;
	};
}

function shouldInsertMultiplication(current: Token, nextToken: Token, functions: Set<string>) {
	const leftTokens = new Set<TokenType>([
		TokenType.Literal,            // 2x      ->  2*x
		TokenType.Identifier,         // x2      ->  x*2
		TokenType.RightParenthesis,   // (x+1)y  ->  (x+1)*y
		TokenType.RightSquareBracket, // [1,2]x  ->  [1,2]*x
		TokenType.RightCurlyBracket,  // {1,2}x  ->  {1,2}*x
		TokenType.Factorial,          // 5!x     ->  5!*x
	]);

	const rightTokens = new Set<TokenType>([
		TokenType.Literal,            // x2      ->  x*2
		TokenType.Identifier,         // xy      ->  x*y
		TokenType.LeftParenthesis,    // x(y+1)  ->  x*(y+1)
		TokenType.LeftSquareBracket,  // x[1,2]  ->  x*[1,2]
		TokenType.LeftCurlyBracket,   // x{1,2}  ->  x*{1,2}
		TokenType.Absolute,           // x|y|    ->  x*|y|
	]);


	let shouldMultiply = true;

	shouldMultiply &&= leftTokens.has(current.type) && rightTokens.has(nextToken.type);
	shouldMultiply &&= !(current.type === TokenType.Literal && nextToken.type === TokenType.Literal); // do not multiply literal literal
	shouldMultiply &&= !functions.has(current.value);

	return shouldMultiply;
}