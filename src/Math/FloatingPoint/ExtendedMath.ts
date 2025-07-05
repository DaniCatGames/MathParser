import { BasicNodes } from "../../Node/BasicNodes";

export const ExtendedMath = {

	// Trigonometric Functions
	sin: (a: number, b: number = 0): [number, number] => {
		return [math.sin(a) * math.cosh(b), math.cos(a) * math.sinh(b)];
	},

	cos: (a: number, b: number = 0): [number, number] => {
		return [math.cos(a) * math.cosh(b), -1 * math.sin(a) * math.sinh(b)];
	},

	tan: (a: number, b: number = 0): [number, number] => {
		return [
			math.sin(2 * a) / (2 + math.cos(2 * a) * math.cosh(2 * b)),
			math.sinh(2 * b) / (2 + math.cos(2 * a) * math.cosh(2 * b)),
		];
	},

	sinh: (a: number, b: number = 0): [number, number] => {
		return [math.sinh(a) * math.cos(b), math.cosh(a) * math.sin(b)];
	},

	cosh: (a: number, b: number = 0): [number, number] => {
		return [math.cosh(a) * math.cos(b), math.sinh(a) * math.sin(b)];
	},

	tanh: (a: number, b: number = 0): [number, number] => {
		return [
			math.sinh(2 * a) / (math.cosh(2 * a) * math.cos(2 * b)),
			math.sin(2 * b) / (math.cosh(2 * a) * math.cos(2 * b)),
		];
	},


	// Hyperbolic Functions
	coth: (a: number, b: number = 0): [number, number] => {
		return [
			math.sinh(2 * a) / (math.cosh(2 * a) - math.cos(2 * b)),
			-math.sin(2 * b) / (math.cosh(2 * a) - math.cos(2 * b)),
		];
	},

	sech: (a: number, b: number = 0): [number, number] => {
		return [
			2 / (math.cosh(2 * a) + math.cos(2 * b)),
			-2 * math.sin(2 * b) / (math.cosh(2 * a) + math.cos(2 * b)),
		];
	},

	csch: (a: number, b: number = 0): [number, number] => {
		return [
			2 * math.sinh(a) / (math.cosh(2 * a) - math.cos(2 * b)),
			-2 * math.sin(b) * math.cosh(a) / (math.cosh(2 * a) - math.cos(2 * b)),
		];
	},

	cot: (a: number, b: number = 0): [number, number] => {
		return [
			math.sin(2 * a) / (math.cos(2 * a) - math.cosh(2 * b)),
			-math.sinh(2 * b) / (math.cos(2 * a) - math.cosh(2 * b)),
		];
	},

	sec: (a: number, b: number = 0): [number, number] => {
		return [
			2 / (math.cos(2 * a) + math.cosh(2 * b)),
			2 * math.sinh(2 * b) / (math.cos(2 * a) + math.cosh(2 * b)),
		];
	},

	csc: (a: number, b: number = 0): [number, number] => {
		return [
			2 * math.sin(a) / (math.cos(2 * a) - math.cosh(2 * b)),
			-2 * math.sinh(b) * math.cos(a) / (math.cos(2 * a) - math.cosh(2 * b)),
		];
	},


	// Constants

	constants: {
		pi: BasicNodes.Literal(math.pi),
		tau: BasicNodes.Literal(math.pi * 2),
		e: BasicNodes.Literal(math.exp(1)),
		phi: BasicNodes.Literal(1.618033988749894),
		inf: BasicNodes.Literal(math.huge),
	},
};