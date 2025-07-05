import { PatternMatcher } from "./Matching/PatternMatcher";
import { Parser } from "./Parse/Parser";
import { Simplifier } from "./Simplification/Simplifier";
import { Node } from "./Typescript/Node";
import { Evaluator } from "./AST/Evaluator";
import { Error } from "./Typescript/Error";
import { PostProcessingPipeline } from "./Parse/PostProcessing/PostProcessor";
import { Registry } from "./Registry";
import { MathFunctions, PostProcessorFunctions } from "./Math/Symbolic/MathFunctions";
import { ExtendedMath } from "./Math/FloatingPoint/ExtendedMath";

export class MathParser {
	private parser: Parser;
	private patternMatcher: PatternMatcher;
	private simplifier: Simplifier;
	private evaluator: Evaluator;
	private postProcessor: PostProcessingPipeline;
	registry: Registry;

	constructor() {
		this.registry = new Registry();
		this.parser = new Parser(this.registry);
		this.patternMatcher = new PatternMatcher();
		this.simplifier = new Simplifier();
		this.evaluator = new Evaluator(this.registry);
		this.postProcessor = new PostProcessingPipeline(this.registry);
		this.setupIdentifiers();
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
			return this.evaluator.Visit(node);
		} catch(error) {
			return error as Error;
		}
	}

	private setupIdentifiers() {
		this.registry.addFunctions(...MathFunctions);
		this.registry.addPostProcessorFunctions(...PostProcessorFunctions);
		this.registry.addConstants(...pairs(ExtendedMath.constants));
	}
}