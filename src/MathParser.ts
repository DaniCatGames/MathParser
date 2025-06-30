import { PatternMatcher } from "./Matching/PatternMatcher";
import { Parser, ParserConfig } from "./Parse/Parser";
import { Simplifier } from "./Simplification/Simplifier";
import { Node } from "./Typescript/Node";
import { Evaluator } from "./AST/Evaluator";
import {
	Function,
	FunctionWithoutDerivative,
	MathFunctions,
	PostProcessorFunctions,
} from "./Math/Symbolic/MathFunctions";
import { Error } from "./Typescript/Error";
import { ExtendedMath } from "./Math/FloatingPoint/ExtendedMath";
import { PostProcessingPipeline } from "./Parse/PostProcessing/PostProcessor";
import { Nodes } from "./Node/NodeUtils";

export class MathParser {
	private parser: Parser;
	private patternMatcher: PatternMatcher;
	private simplifier: Simplifier;
	private evaluator: Evaluator;
	private postProcessor: PostProcessingPipeline;

	functions: Function[] = [];
	variables: { [variable: string]: number } = {};
	constants: { [variable: string]: number } = {};

	constructor(parserConfig?: Partial<ParserConfig>) {
		this.parser = new Parser(parserConfig);
		this.patternMatcher = new PatternMatcher();
		this.simplifier = new Simplifier();
		this.evaluator = new Evaluator();
		this.postProcessor = new PostProcessingPipeline();
		this.setupIdentifiers();
	}

	addVariables(...variables: ([string, number] | string)[]) {
		variables.forEach((variable) => {
			if(typeIs(variable, "string")) {
				this.variables[variable] = 0;
				this.parser.addVariable(variable);
			} else {
				this.variables[variable[0]] = variable[1];
				this.parser.addVariable(variable[0]);
				this.evaluator.addVariable(variable[0], variable[1]);
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
					derivative: () => Nodes.Zero(),
				};
			}

			this.functions.push(newFunc);
			this.parser.addFunction(newFunc);
			this.evaluator.addFunction(newFunc);
		});
	}

	addConstants(...constants: ([string, number])[]) {
		constants.forEach((constant) => {
			this.constants[constant[0]] = constant[1];
			this.parser.addConstant(constant[0]);
			this.evaluator.addConstant(constant[0], constant[1]);
		});
	}

	parse(equation: string): Node | Error {
		try {
			const parsed = this.parser.parse(equation);
			return this.postProcessor.process(parsed);
		} catch(error) {
			return error as Error;
		}
	}

	evaluate(node: Node): number | Error {
		try {
			return this.evaluator.Numeric(node);
		} catch(error) {
			return error as Error;
		}
	}

	private setupIdentifiers() {
		this.addFunctions(...MathFunctions);
		this.addFunctions(...PostProcessorFunctions.map(postproc => postproc.fn));
		this.addConstants(...pairs(ExtendedMath.constants));
	}
}