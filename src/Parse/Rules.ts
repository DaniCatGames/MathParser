import { Associativity, BinaryOperator, GrammarRule, ParserContext, Token, TokenType } from "../Typescript/Parsing";
import { Node } from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { BasicNodes } from "../Node/BasicNodes";
import { Nodes } from "../Node/NodeUtils";
import { TensorParser } from "./TensorParser";

export class LiteralRule implements GrammarRule {
	name = "Literal";
	priority = 100;
	description = "Parses a number";
	enabled = true;

	canStartWith(token: Token, parser: ParserContext): boolean {
		return token.type === TokenType.Literal;
	}

	prefix(parser: ParserContext): Node {
		const token = parser.eat(TokenType.Literal);
		const number = tonumber(token.value);

		if(!number) {
			throw new Error(ErrorType.Parser, {
				message: `Invalid literal: ${token.value}`,
				token: token,
			});
		}

		return BasicNodes.Literal(number);
	}
}

export class ParenthesesRule implements GrammarRule {
	name = "Parentheses";
	priority = 100;
	description = "Parses parenthesized expressions";
	enabled = true;

	canStartWith(token: Token, parser: ParserContext): boolean {
		return token.type === TokenType.LeftParenthesis;
	}

	parsePrefix(parser: ParserContext): Node {
		parser.eat(TokenType.LeftParenthesis);
		const expression = parser.expression();
		parser.eat(TokenType.RightParenthesis);
		return expression;
	}
}

export class BinaryOperatorRule implements GrammarRule {
	name = "BinaryOperator";
	priority = 90;
	description = "Parses binary operators";
	enabled = true;

	constructor(private operators: BinaryOperator[]) {
	}

	canStartWith(token: Token, parser: ParserContext): boolean {
		return this.operators.some(op => op.tokenType === token.type);
	}

	mixfix(parser: ParserContext, left: Node): Node {
		const operator = parser.eat();
		const opInfo = this.operators.find(op => op.tokenType === operator.type)!;

		const precedence = this.operators.find(op => op.tokenType === operator.type)!.precedence;
		const realPrecedence = opInfo.associativity === Associativity.Right ? precedence - 1 : precedence;

		const right = parser.expression(realPrecedence);

		return opInfo.creator(left, right);
	}
}

export class UnaryOperatorRule implements GrammarRule {
	name = "UnaryOperators";
	priority = 95;
	description = "Parses unary operators";
	enabled = true;

	canStartWith(token: Token): boolean {
		return token.type === TokenType.Subtract || token.type === TokenType.Add;
	}

	prefix(parser: ParserContext): Node {
		const startToken = parser.eat();

		parser.eat(startToken.type);
		const operand = parser.expression(4); // High precedence for unary

		if(startToken.type === TokenType.Subtract) {
			return Nodes.Negative(operand);
		}

		return operand;
	}
}

export class FunctionCallRule implements GrammarRule {
	name = "FunctionCall";
	priority = 95;
	description = "Parses function calls";
	enabled = true;

	canStartWith(token: Token, parser: ParserContext): boolean {
		return token.type === TokenType.Identifier && parser.isFunction(token.value);
	}

	prefix(parser: ParserContext): Node {
		const name = parser.eat(TokenType.Identifier);
		const args = parser.parseList(TokenType.LeftParenthesis, TokenType.RightParenthesis, TokenType.Comma);

		const func = parser.findFunction(name.value);
		if(!func) throw new Error(ErrorType.Parser, {
			message: `No function found with name: ${name.value}`,
			token: name,
		});

		if(func.arguments !== args.size()) {
			throw new Error(ErrorType.Parser, {
				message: "Incorrect number of arguments for function",
				functionName: name.value,
				expected: func.arguments,
				got: args.size(),
			});
		}

		return BasicNodes.Function(name.value, ...args);
	}
}

export class VariableRule implements GrammarRule {
	name = "Variable";
	priority = 80;
	description = "Parses variables and constants";
	enabled = true;

	canStartWith(token: Token, parser: ParserContext): boolean {
		return token.type === TokenType.Identifier && !parser.isFunction(token.value);
	}

	prefix(parser: ParserContext): Node {
		const token = parser.eat(TokenType.Identifier);

		if(parser.isConstant(token.value)) {
			return BasicNodes.Constant(token.value);
		} else {
			return BasicNodes.Variable(token.value);
		}
	}
}

export class TensorRule implements GrammarRule {
	name = "Tensor";
	priority = 90;
	description = "Parses tensors";
	enabled = true;

	canStartWith(token: Token): boolean {
		return token.type === TokenType.LeftSquareBracket;
	}

	prefix(parser: ParserContext): Node {
		const args = parser.parseList(TokenType.LeftSquareBracket, TokenType.RightSquareBracket, TokenType.Comma);
		const structure = TensorParser.analyzeTensorStructure(args);
		return BasicNodes.Tensor(args, structure.shape);
	}
}

export class ListRule implements GrammarRule {
	name = "List";
	priority = 90;
	description = "Parses lists";
	enabled = true;

	canStartWith(token: Token): boolean {
		return token.type === TokenType.LeftCurlyBracket;
	}

	prefix(parser: ParserContext): Node {
		const args = parser.parseList(TokenType.LeftCurlyBracket, TokenType.RightCurlyBracket, TokenType.Comma);
		return BasicNodes.List(...args);
	}
}

export class AbsoluteValueRule implements GrammarRule {
	name = "AbsoluteValue";
	priority = 90;
	description = "Parses absolute values";
	enabled = true;

	canStartWith(token: Token): boolean {
		return token.type === TokenType.Absolute;
	}

	prefix(parser: ParserContext): Node {
		parser.eat(TokenType.Absolute);
		const expression = parser.expression();
		parser.eat(TokenType.Absolute, "Expected closing absolute value bar");
		return BasicNodes.Absolute(expression);
	}
}

export class FactorialRule implements GrammarRule {
	name = "Factorial";
	priority = 95;
	description = "Parses factorials";
	enabled = true;

	canStartWith(token: Token): boolean {
		return token.type === TokenType.Factorial;
	}

	getPrecedence(): number {
		return 6;
	}

	mixfix(parser: ParserContext, left: Node): Node {
		parser.eat(TokenType.Factorial);
		return BasicNodes.Factorial(left);
	}
}