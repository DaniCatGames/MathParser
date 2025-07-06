import { Associativity, BinaryOperator, GrammarRule, ParserContext, Token, TokenType } from "../Typescript/Parsing";
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
import { Nodes } from "../Node/NodeUtils";

const operators: BinaryOperator[] = [{
	tokenType: TokenType.Exponentiation,
	precedence: 5,
	creator: (left, right) => Nodes.Exponentiation(left, right),
	associativity: Associativity.Right,
}, {
	tokenType: TokenType.Multiply,
	precedence: 3,
	creator: (left, right) => Nodes.Multiply(left, right),
}, {
	tokenType: TokenType.Divide,
	precedence: 3,
	creator: (left, right) => Nodes.Divide(left, right),
}, {
	tokenType: TokenType.Add,
	precedence: 2,
	creator: (left, right) => Nodes.Add(left, right),
}, {
	tokenType: TokenType.Subtract,
	precedence: 2,
	creator: (left, right) => Nodes.Subtract(left, right),
}];

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
		this.SetupDefault();
	}

	Parse(input: string) {
		this.tokenStream.reset();
		this.tokenStream.tokenize(input);
		this.lookahead = this.tokenStream.nextToken();
		this.endOfInput = false;
		return this.Expression();
	}

	private SetupDefault() {
		this.AddRule(new LiteralRule());
		this.AddRule(new ParenthesesRule());
		this.AddRule(new BinaryOperatorRule(operators));
		this.AddRule(new UnaryOperatorRule());
		this.AddRule(new FunctionCallRule());
		this.AddRule(new VariableRule());
		this.AddRule(new TensorRule());
		this.AddRule(new ListRule());
		this.AddRule(new AbsoluteValueRule());
		this.AddRule(new FactorialRule());
	}

	AddRule(rule: GrammarRule) {
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

	IsEnabled(name: string) {
		const rule = this.rules.get(name);
		return rule ? rule.enabled : false;
	}

	Eat(tokenType?: TokenType, errorMessage?: string) {
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

	Peek() {
		return this.lookahead;
	}

	Expression(precedence: number = 0): Node {
		let left = this.Prefix();

		while(precedence < this.GetPrecedence(this.lookahead)) {
			left = this.Mixfix(left);
		}

		return left;
	}

	private Prefix() {
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

	private Mixfix(left: Node) {

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

	ParseList(startType: TokenType, endType: TokenType, separator: TokenType): Node[] {
		this.Eat(startType);

		let loopCounter = 0;
		const args: Node[] = [];

		while(this.lookahead.type !== endType) {
			loopCounter++;
			if(loopCounter > this.maxListSize) throw new Error(ErrorType.Parser, {
				message: "Max list size exceeded",
			});

			args.push(this.Expression());

			if(this.lookahead.type !== separator) break;
			this.Eat(TokenType.Comma);
		}

		this.Eat(endType);
		return args;
	}

	HasMoreTokens(): boolean {
		return !this.endOfInput;
	}

	IsFunction(name: string): boolean {
		return this.registry.functions.some(fn => fn.names.includes(name));
	}

	FindFunction(name: string): Function | undefined {
		return this.registry.functions.find(fn => fn.names.includes(name));
	}

	IsConstant(name: string): boolean {
		let isConstant = false;
		for(const [cName, _] of pairs(this.registry.constants)) isConstant ||= cName === name;
		return isConstant;
	}

	GetPrecedence(token: Token | "unary"): number {
		if(token === "unary") return 4;
		return operators.find(op => op.tokenType === token.type)?.precedence || 0;
	}
}