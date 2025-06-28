import { Error, ErrorType } from "../Typescript/Error";
import { TokenStream } from "./Tokenizing/TokenStream";
import { TensorParser } from "./TensorParser";
import { Token, TokenType } from "../Typescript/Parsing";
import { Node } from "../Typescript/Node";
import { Function } from "../Math/Symbolic/MathFunctions";
import { BasicNodes } from "../Node/BasicNodes";

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

const surroundOperators = new Map<TokenType, [TokenType, TokenType]>([
	[TokenType.LeftParenthesis, [TokenType.RightParenthesis, TokenType.Comma]],
	[TokenType.LeftCurlyBracket, [TokenType.RightCurlyBracket, TokenType.Comma]],
	[TokenType.LeftSquareBracket, [TokenType.RightSquareBracket, TokenType.Comma]],
]);

export interface ParserConfig {
	maxListSize: number;
}

export class Parser {
	private readonly config: ParserConfig;

	private tokenStream: TokenStream;
	private lookahead: Token = {type: TokenType.Add, value: "", index: 0};
	private endOfInput = false;

	private functions = new Set<Function>();
	private variables = new Set<string>();
	private constants = new Set<string>();

	constructor(config?: Partial<ParserConfig>) {
		this.config = {
			maxListSize: 200,
			...config,
		};
		this.tokenStream = new TokenStream("");
	}

	parse(input: string) {
		this.reset();
		this.tokenStream.tokenize(input);
		this.lookahead = this.tokenStream.nextToken();

		return this.expression();
	}

	reset() {
		this.tokenStream.reset();
		this.endOfInput = false;
	}

	private eat(tokenType: TokenType) {
		if(this.endOfInput) throw new Error(ErrorType.Parser, {
			message: "Unexpected end of input",
		});

		const token = this.lookahead;

		if(token.type !== tokenType) throw new Error(ErrorType.Parser, {
			message: "Unexpected token",
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

	private expression(precedence: number = 0) {
		let left = this.prefix();

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

	private listExpression() {
		const args = this.seperatedExpression(TokenType.LeftCurlyBracket);

		return BasicNodes.List(...args);
	}

	private tensorExpression() {
		const args = this.seperatedExpression(TokenType.LeftSquareBracket);

		const structure = TensorParser.analyzeTensorStructure(args);

		return BasicNodes.Tensor(args, structure.shape);
	}

	private unaryExpression() {
		this.eat(TokenType.Subtract);
		return BasicNodes.Negative(this.expression(getPrecedence("unary")));
	}

	private functionExpression() {
		const name = this.eat(TokenType.Identifier).value;

		const args = this.seperatedExpression(TokenType.LeftParenthesis);

		this.functions.forEach(fn => {
			if(fn.arguments !== args.size()) {
				throw new Error(ErrorType.Parser, {
					message: "Too many/few arguments for this function",
					args: args,
					argumentAmount: args.size(),
					requiredArgs: fn.arguments,
				});
			}
		});

		return BasicNodes.Function(name, ...args);
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

		if(endingType === undefined || argumentSeparator === undefined)
			throw new Error(ErrorType.Parser, {
				message: "Error parsing seperated expression",
			});

		let loopCounter = 0;
		const args: Node[] = [];

		while(this.lookahead.type !== endingType) {
			loopCounter++;
			if(loopCounter > this.config.maxListSize) throw new Error(ErrorType.Parser, {
				message: "Max list size exceeded",
			});

			args.push(this.expression());

			if(this.lookahead.type !== argumentSeparator) break;

			this.eat(TokenType.Comma);
		}

		this.eat(endingType);

		return args;
	}

	private absoluteExpression() {
		this.eat(TokenType.Absolute);
		const expression = this.expression();
		this.eat(TokenType.Absolute);
		return BasicNodes.Absolute(expression);
	}

	private identifier() {
		if(this.isFunction(this.lookahead.value)) return this.functionExpression();

		const variable = this.eat(TokenType.Identifier);
		if(this.constants.has(variable.value)) {
			return BasicNodes.Constant(variable.value);
		} else {
			return BasicNodes.Variable(variable.value);
		}
	}

	private prefix(): Node {
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
				return BasicNodes.Literal(tonumber(this.eat(TokenType.Literal).value)!);
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

		throw new Error(ErrorType.Parser, {
			message: "Unknown prefix token",
			type: this.lookahead.type,
			value: this.lookahead.value,
		});
	}

	private mixfix(leftNode: Node, operatorType: TokenType): Node {
		const token = this.eat(operatorType);
		const newPrecedence = getPrecedence(token);

		switch(token.type) {
			case TokenType.Add:
				return BasicNodes.Add(leftNode, this.expression(newPrecedence));
			case TokenType.Subtract:
				return BasicNodes.Subtract(leftNode, this.expression(newPrecedence));
			case TokenType.Multiply:
				return BasicNodes.Multiply(leftNode, this.expression(newPrecedence));
			case TokenType.Divide:
				return BasicNodes.Divide(leftNode, this.expression(newPrecedence));
			case TokenType.Exponentiation:
				return BasicNodes.Exponentiation(leftNode, this.expression(newPrecedence - 1));
			case TokenType.Factorial:
				return BasicNodes.Factorial(leftNode);
		}

		throw new Error(ErrorType.Parser, {
			message: "Unknown mixfix token",
			type: token.type,
			value: token.value,
		});
	}

	private isFunction(input: string) {
		let has = false;
		this.functions.forEach((func) => {
			if(func.names.includes(input)) has = true;
		});
		return has;
	}

	private unexpectedTokenError(message: string) {
		throw new Error(ErrorType.Parser, {
			message: message,
			expected: "Expression",
			got: this.lookahead.type,
			atIndex: this.lookahead.index,
		});
	}

	addVariable(variable: string) {
		this.variables.add(variable);
		this.tokenStream.addIdentifier(variable);
	}

	addConstant(constant: string) {
		this.constants.add(constant);
		this.tokenStream.addIdentifier(constant);
	}

	addFunction(fn: Function) {
		this.functions.add(fn);
		fn.names.forEach((name) => {
			this.tokenStream.addIdentifier(name);
			this.tokenStream.addFunction(name);
		});
	}
}

function getPrecedence(token: Token | "unary"): number {
	const operator = (token === "unary") ? operators.get(token) : operators.get(token.value);
	return operator ? operator : 0;
}