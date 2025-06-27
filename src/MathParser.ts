import { PatternMatcher } from "./Matching/PatternMatcher";
import { Parser, ParserConfig } from "./Parse/Parser";
import { Simplifier } from "./Simplification/Simplifier";
import { Node } from "./Typescript/Node";
import { Evaluator } from "./AST/Evaluator";
import { Function, FunctionWithoutDerivative } from "./Math/Symbolic/MathFunctions";
import { BasicNodes } from "./Node/BasicNodes";
import { Error } from "./Typescript/Error";

export class MathParser {
	private parser: Parser;
	private patternMatcher: PatternMatcher;
	private simplifier: Simplifier;
	private evaluator: Evaluator;

	functions: Function[] = [];
	variables: { [variable: string]: number } = {};
	constants: { [variable: string]: number } = {};

	constructor(parserConfig?: Partial<ParserConfig>) {
		this.parser = new Parser(parserConfig);
		this.patternMatcher = new PatternMatcher();
		this.simplifier = new Simplifier();
		this.evaluator = new Evaluator([], {});
	}

	addVariables(...variables: ([string, number] | string)[]) {
		variables.forEach((variable) => {
			if(typeIs(variable, "string")) {
				this.variables[variable] = 0;
				this.parser.addVariable(variable);
			} else {
				this.variables[variable[0]] = variable[1];
				this.parser.addVariable(variable[0]);
			}
		});
	}

	addFunctions(...functions: (Function | FunctionWithoutDerivative)[]) {
		functions.forEach(func => {
			let newFunc;
			if("derivative" in func) {
				newFunc = func;
			} else {
				newFunc = {
					...func,
					derivative: () => BasicNodes.Zero(),
				};
			}

			this.functions.push(newFunc);
			this.parser.addFunction(newFunc);
			this.evaluator.addFunction(newFunc);
		});
	}
}