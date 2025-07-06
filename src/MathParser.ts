import { PatternMatcher } from "./Matching/PatternMatcher";
import { Parser } from "./Parse/Parser";
import { Simplifier } from "./Simplification/Simplifier";
import { Node } from "./Typescript/Node";
import { Error } from "./Typescript/Error";
import { PostProcessingPipeline } from "./Parse/PostProcessor";
import { Registry } from "./Registry";
import { MathFunctions, PostProcessorFunctions } from "./Math/Symbolic/MathFunctions";
import { ExtendedMath } from "./Math/FloatingPoint/ExtendedMath";
import { Evaluator } from "./Visitors/Number";

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
		this.SetupIdentifiers();
	}

	Parse(equation: string): Node | Error {
		try {
			const parsed = this.parser.Parse(equation);
			return this.postProcessor.Process(parsed);
		} catch(error) {
			return error as Error;
		}
	}

	Evaluate(node: Node): number | Error {
		try {
			return this.evaluator.Visit(node);
		} catch(error) {
			return error as Error;
		}
	}

	private SetupIdentifiers() {
		this.registry.AddFunctions(...MathFunctions);
		this.registry.AddPostProcessorFunctions(...PostProcessorFunctions);
		this.registry.AddConstants(...pairs(ExtendedMath.constants));
	}
}