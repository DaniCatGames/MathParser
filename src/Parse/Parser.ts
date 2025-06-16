import { Error, ErrorType } from "../Typescript/Error";
import {
	postProcAbsolute,
	postProcBinary,
	postProcFactorial,
	postProcFunction,
	postProcLiteral,
	postProcMatrix,
	postProcTensor,
	postProcUnary,
	postProcVariable,
	postProcVector,
} from "./PostProcNodes";
import { Plugins } from "./Plugins";
import { TokenStream } from "./Tokenizing/TokenStream";
import { complexLiterals, flattenAST, postProcess } from "./PostProcessor";
import { TensorParser } from "./TensorParser";
import { PostProcList, PostProcNode, PostProcTensor, PostProcType, Token, TokenType } from "../Typescript/Parsing";
import { BasicNodes } from "../Node/BasicNodes";
import { Node } from "../Typescript/Node";

// <Operator, Precedence>
const operators = new Map<string, number>([
	["!", 6],
	["^", 5],
	["unary", 4],
	["*", 3],
	["/", 3],
	["+", 2],
	["-", 2],
]);

const postfixOperators = ["!"];

const surroundOperators = new Map<TokenType, [TokenType, TokenType]>([
	[TokenType.LeftParenthesis, [TokenType.RightParenthesis, TokenType.Comma]],
	[TokenType.LeftCurlyBracket, [TokenType.RightCurlyBracket, TokenType.Comma]],
	[TokenType.LeftSquareBracket, [TokenType.RightSquareBracket, TokenType.Comma]],
]);

export interface ParserConfig {
	extraFunctions: string[]; //TODO: implement number of arguments validation
	extraConstants: string[];
	plugins: (keyof typeof Plugins)[];
	maxListSize: number;
}

export class Parser {
	private readonly config: ParserConfig;
	private tokenStream: TokenStream;
	private lookahead: Token = {type: TokenType.Add, value: "", index: 0};
	private functions = new Set<string>();
	private constants = new Set<string>();
	private endOfInput = false;
	private result: Node = BasicNodes.Zero();

	constructor(config?: Partial<ParserConfig>) {
		this.config = {
			extraFunctions: [],
			extraConstants: [],
			plugins: [],
			maxListSize: 200,
			...config,
		};

		this.tokenStream = new TokenStream("", this.config);
		this.functions = this.tokenStream.functions;
		this.constants = this.tokenStream.constants;

		this.implementPlugins();
	}

	parse(input: string) {
		this.reset();

		this.tokenStream.tokenize(input);

		this.lookahead = this.tokenStream.nextToken();

		const result = this.expression();
		this.result = postProcess(result);
		this.result = flattenAST(this.result);
		this.result = complexLiterals(this.result);

		return this.result;
	}

	reset() {
		this.tokenStream.reset();
		this.endOfInput = false;
	}

	private eat(tokenType: TokenType) {
		if(this.endOfInput) throw new Error(ErrorType.UnexpectedEndOfInput, {});

		const token = this.lookahead;

		if(token.type !== tokenType) throw new Error(ErrorType.UnexpectedToken, {
			expected: tokenType,
			got: token.type,
		});

		try {
			this.lookahead = this.tokenStream.nextToken();
		} catch(_) {
			this.endOfInput = true;
		}

		return token;
	}

	private expression(precedence: number = 0): PostProcNode {
		let left: PostProcNode = this.prefix();

		while(precedence < getPrecedence(this.lookahead)) {
			left = this.mixfix(left, this.lookahead.type);
		}

		return left;
	}

	private parenthesizedExpression() {
		this.eat(TokenType.LeftParenthesis);
		const expression = this.expression();
		this.eat(TokenType.RightParenthesis);
		return expression;
	}

	private listExpression(): PostProcList {
		const args = this.seperatedExpression(TokenType.LeftCurlyBracket);

		return {
			type: PostProcType.List,
			args: args,
		};
	}

	private tensorExpression(): PostProcTensor {
		const args = this.seperatedExpression(TokenType.LeftSquareBracket);

		const classification = TensorParser.classifyArrayStructure(args);

		switch(classification) {
			case "Vector":
				return postProcVector(args);
			case "Matrix":
				const matrixStructure = TensorParser.analyzeTensorStructure(args);
				return postProcMatrix(TensorParser.flattenTensor(args), matrixStructure.shape[0], matrixStructure.shape[1]);
			case "Tensor":
				const tensorStructure = TensorParser.analyzeTensorStructure(args);
				return postProcTensor(TensorParser.flattenTensor(args), tensorStructure.shape);
			case "Invalid":
				throw new Error(ErrorType.TypeError, {message: "Invalid Tensor Structure"});
		}
	}

	private unaryExpression() {
		this.eat(TokenType.Subtract);
		return postProcUnary(this.expression(getPrecedence("unary")));
	}

	private functionExpression() {
		const id = this.eat(TokenType.Identifier).value;

		const args = this.seperatedExpression(TokenType.LeftParenthesis);

		return postProcFunction(id, args);
	}

	private seperatedExpression(start: TokenType) {
		this.eat(start);

		let endingType: TokenType | undefined;
		let argumentSeparator: TokenType | undefined;
		surroundOperators.forEach((value, key) => {
			if(key === start) {
				endingType = value[0];
				argumentSeparator = value[1];
			}
		});
		if(endingType === undefined || argumentSeparator === undefined) throw new Error(ErrorType.TypeError, {});

		let loopCounter = 0;
		const args: PostProcNode[] = [];

		while(this.lookahead.type !== endingType) {
			loopCounter++;
			if(loopCounter > this.config.maxListSize) throw new Error(ErrorType.MaxSizeExceeded, {});

			args.push(this.expression());

			if(this.lookahead.type !== argumentSeparator) break;

			this.eat(TokenType.Comma);
		}

		this.eat(endingType);

		return args;
	}

	private absoluteExpression(): PostProcNode {
		this.eat(TokenType.Absolute);
		const expression = this.expression();
		this.eat(TokenType.Absolute);
		return postProcAbsolute(expression);
	}

	private identifier() {
		if(this.isFunction(this.lookahead.value)) return this.functionExpression();

		const variable = this.eat(TokenType.Identifier);
		return postProcVariable(variable.value);
	}

	private prefix(): PostProcNode {
		switch(this.lookahead.type) {
			case TokenType.LeftParenthesis:
				return this.parenthesizedExpression();
			case TokenType.LeftSquareBracket:
				return this.tensorExpression();
			case TokenType.LeftCurlyBracket:
				return this.listExpression();
			case TokenType.Absolute:
				return this.absoluteExpression();
			case TokenType.Identifier:
				return this.identifier();
			case TokenType.Subtract:
				return this.unaryExpression();
			case TokenType.Literal:
				return postProcLiteral(this.eat(TokenType.Literal));
			case TokenType.Add:
				this.eat(TokenType.Add);
				return this.expression(getPrecedence("unary"));

			case TokenType.RightParenthesis:
				this.unexpectedTokenError("Unexpected right parenthesis, missing left parenthesis or expression");
				break;
			case TokenType.RightSquareBracket:
				this.unexpectedTokenError("Unexpected right square bracket, missing left square bracket or expression");
				break;
			case TokenType.RightCurlyBracket:
				this.unexpectedTokenError("Unexpected right curly bracket, missing left curly bracket or expression");
				break;
			case TokenType.Comma:
				this.unexpectedTokenError("Unexpected comma, missing expression before comma");
				break;
			case TokenType.Multiply:
				this.unexpectedTokenError("Unexpected multiplication, missing expression before multiplication");
				break;
			case TokenType.Divide:
				this.unexpectedTokenError("Unexpected division, missing expression before division");
				break;
			case TokenType.Exponentiation:
				this.unexpectedTokenError("Unexpected exponentiation, missing expression before exponentiation");
				break;
			case TokenType.Factorial:
				this.unexpectedTokenError("Unexpected factorial, missing expression before factorial");
				break;
		}

		throw new Error(ErrorType.UnknownPrefixToken, {
			type: this.lookahead.type,
			value: this.lookahead.value,
		});
	}

	private mixfix(leftNode: PostProcNode, operatorType: TokenType): PostProcNode {
		const token = this.eat(operatorType);
		const newPrecedence = getPrecedence(token);

		switch(token.type) {
			case TokenType.Add:
				return postProcBinary(PostProcType.Add, leftNode, this.expression(newPrecedence));
			case TokenType.Subtract:
				return postProcBinary(PostProcType.Subtract, leftNode, this.expression(newPrecedence));
			case TokenType.Multiply:
				return postProcBinary(PostProcType.Multiply, leftNode, this.expression(newPrecedence));
			case TokenType.Divide:
				return postProcBinary(PostProcType.Divide, leftNode, this.expression(newPrecedence));
			case TokenType.Exponentiation:
				return postProcBinary(PostProcType.Exponentiation, leftNode, this.expression(newPrecedence - 1));
			case TokenType.Factorial:
				return postProcFactorial(leftNode);
		}

		throw new Error(ErrorType.UnknownMixfixToken, {
			type: token.type,
			value: token.value,
		});
	}

	private isFunction(input: string) {
		return this.functions.has(input);
	}

	private implementPlugins() {
		this.config.plugins.forEach(name => {
			const plugin = Plugins[name];

			for(const [key, _] of pairs(plugin.functions)) {
				if(!this.functions.has(key as string)) this.functions.add(key as string);
			}

			for(const [key, _] of pairs(plugin.constants)) {
				if(!this.constants.has(key as string)) this.constants.add(key as string);
			}
		});
	}

	private unexpectedTokenError(message: string) {
		throw new Error(ErrorType.UnexpectedToken, {
			expected: "Expression",
			got: this.lookahead.type,
			atIndex: this.lookahead.index,
			message: message,
		});
	}
}

function getPrecedence(token: Token | "unary"): number {
	const operator = (token === "unary") ? operators.get(token) : operators.get(token.value);
	return operator ? operator : 0;
}