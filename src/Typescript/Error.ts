export enum ErrorType {
	MaxDepthExceeded = "MaxDepthExceeded",
	CacheError = "CacheError",

	Tensor = "Tensor",
	Derivative = "Derivative",
	Evaluator = "Evaluator",
	Polynomial = "Polynomial",
	Visualizer = "Visualizer",
	Complex = "Complex",
	Parser = "Parser",
	Tokenizer = "Tokenizer",
}

export class Error {
	error: ErrorType;
	context: Record<string, unknown>;

	constructor(err: ErrorType, context: Record<string, unknown>) {
		this.error = err;
		this.context = context;
	}
}