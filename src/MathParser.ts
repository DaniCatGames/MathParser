import { PatternMatcher } from "./Matching/PatternMatcher";
import { Parser, ParserConfig } from "./Parse/Parser";
import { Simplifier } from "./Simplification/Simplifier";
import { Node } from "./Typescript/Node";
import { Evaluator } from "./Solving/Evaluator";
import { Function, FunctionWithoutDerivative } from "./Math/Symbolic/MathFunctions";

type Equation = Node;

export class MathParser {
	parser: Parser;
	patternMatcher: PatternMatcher;
	simplifier: Simplifier;
	evaluator: Evaluator;

	functions: (Function | FunctionWithoutDerivative)[] = [];
	variables: { [variable: string]: number } = {};

	constructor(parserConfig?: Partial<ParserConfig>) {
		this.parser = new Parser(parserConfig);
		this.patternMatcher = new PatternMatcher();
		this.simplifier = new Simplifier();
		this.evaluator = new Evaluator({}, {});
	}

	addFunction() {

	}
}