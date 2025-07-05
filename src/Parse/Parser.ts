import { GrammarRule, ParserContext, Token, TokenType } from "../Typescript/Parsing";
import { Node } from "../Typescript/Node";
import { Function } from "../Math/Symbolic/MathFunctions";
import { Error, ErrorType } from "../Typescript/Error";
import { TokenStream } from "./Tokenizing/TokenStream";

import {
	AbsoluteValueRule,
	BinaryOperatorRule,
	FactorialRule,
	FunctionCallRule,
	ListRule,
	LiteralRule,
	ParenthesesRule,
	TensorRule,
	UnaryOperatorRule,
	VariableRule,
} from "./Rules";
import { Registry } from "../Registry";

const operators = new Map<string, number>([
	["!", 6],
	["^", 5],
	["unary", 4],
	["*", 3],
	["/", 3],
	["+", 2],
	["-", 2],
]);

export class Parser implements ParserContext {
	private rules: Map<string, GrammarRule> = new Map();
	private prefixRules: GrammarRule[] = [];
	private mixfixRules: GrammarRule[] = [];

	private tokenStream: TokenStream;
	private lookahead: Token = {type: TokenType.Add, value: "", index: 0};
	private endOfInput = false;

	private maxListSize = 200;

	constructor(private registry: Registry) {
		this.tokenStream = new TokenStream(this.registry);
		this.setupDefault();
	}

	parse(input: string) {
		this.tokenStream.reset();
		this.tokenStream.tokenize(input);
		this.lookahead = this.tokenStream.nextToken();
		this.endOfInput = false;
		return this.expression();
	}

	private setupDefault() {
		this.addRule(new LiteralRule());
		this.addRule(new ParenthesesRule());
		this.addRule(new BinaryOperatorRule());
		this.addRule(new UnaryOperatorRule());
		this.addRule(new FunctionCallRule());
		this.addRule(new VariableRule());
		this.addRule(new TensorRule());
		this.addRule(new ListRule());
		this.addRule(new AbsoluteValueRule());
		this.addRule(new FactorialRule());
	}

	addRule(rule: GrammarRule) {
		if(this.rules.has(rule.name)) {
			throw new Error(ErrorType.Parser, {
				message: `Rule '${rule.name}' already exists`,
			});
		}

		this.rules.set(rule.name, rule);

		if("mixfix" in rule) this.mixfixRules.push(rule);
		if("prefix" in rule) this.prefixRules.push(rule);

		this.prefixRules.sort((a, b) => a.priority > b.priority);
		this.mixfixRules.sort((a, b) => a.priority > b.priority);
	}

	//TODO remove/disable/enable rules

	isEnabled(name: string) {
		const rule = this.rules.get(name);
		return rule ? rule.enabled : false;
	}

	eat(tokenType?: TokenType, errorMessage?: string) {
		if(this.endOfInput) throw new Error(ErrorType.Parser, {
			message: errorMessage || "Unexpected end of input",
		});

		const token = this.lookahead;

		if(tokenType && token.type !== tokenType) throw new Error(ErrorType.Parser, {
			message: errorMessage || "Unexpected token",
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

	peek() {
		return this.lookahead;
	}

	expression(precedence: number = 0): Node {
		let left = this.prefix();

		while(precedence < this.getPrecedence(this.lookahead)) {
			left = this.mixfix(left);
		}

		return left;
	}

	private prefix() {
		for(const rule of this.prefixRules) {
			if(!rule.enabled) continue;

			if(rule.canStartWith(this.lookahead, this) && rule.prefix) {
				return rule.prefix(this);
			}
		}

		throw new Error(ErrorType.Parser, {
			message: `No prefix rule found for token: ${this.lookahead.value}`,
			token: this.lookahead,
		});
	}

	private mixfix(left: Node) {

		for(const rule of this.mixfixRules) {
			if(!rule.enabled) continue;

			if(rule.canStartWith(this.lookahead, this) && rule.mixfix) {
				return rule.mixfix(this, left);
			}
		}

		throw new Error(ErrorType.Parser, {
			message: `No mixfix rule found for token: ${this.lookahead.value}`,
			token: this.lookahead,
		});
	}

	parseList(startType: TokenType, endType: TokenType, separator: TokenType): Node[] {
		this.eat(startType);

		let loopCounter = 0;
		const args: Node[] = [];

		while(this.lookahead.type !== endType) {
			loopCounter++;
			if(loopCounter > this.maxListSize) throw new Error(ErrorType.Parser, {
				message: "Max list size exceeded",
			});

			args.push(this.expression());

			if(this.lookahead.type !== separator) break;
			this.eat(TokenType.Comma);
		}

		this.eat(endType);
		return args;
	}

	hasMoreTokens(): boolean {
		return !this.endOfInput;
	}

	isFunction(name: string): boolean {
		return this.registry.functions.some(fn => fn.names.includes(name));
	}

	findFunction(name: string): Function | undefined {
		return this.registry.functions.find(fn => fn.names.includes(name));
	}

	isConstant(name: string): boolean {
		let isConstant = false;
		for(const [cName, _] of pairs(this.registry.constants)) isConstant ||= cName === name;
		return isConstant;
	}

	getPrecedence(token: Token | "unary"): number {
		const precedence = (token === "unary") ? operators.get(token) : operators.get(token.value);
		return precedence ? precedence : 0;
	}
}