export enum ErrorType {
	MaxDepthExceeded = "MaxDepthExceeded",
	InvalidNodeType = "InvalidNodeType",
	CacheError = "CacheError",

	UnknownToken = "UnknownToken",
	UnexpectedEndOfInput = "UnexpectedEndOfInput",
	UnexpectedToken = "UnexpectedToken",
	UnknownMixfixToken = "UnknownMixfixToken",
	UnknownPrefixToken = "UnknownPrefixToken",

	TypeError = "TypeError",

	MaxSizeExceeded = "MaxSizeExceeded",

	Tensor = "Tensor",
	Derivative = "Derivative",
	Evaluator = "Evaluator",
	Polynomial = "Polynomial",
	Visualizer = "Visualizer",
	Complex = "Complex",
	Parser = "Parser",
}

export class Error {
	error: ErrorType;
	context: Record<string, unknown>;

	constructor(err: ErrorType, context: Record<string, unknown>) {
		this.error = err;
		this.context = context;
	}
}