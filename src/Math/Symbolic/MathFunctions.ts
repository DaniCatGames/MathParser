import { ExtendedMath } from "../FloatingPoint/ExtendedMath";

import { Node } from "../../Typescript/Node";
import { BasicNodes } from "../../Node/BasicNodes";
import { ComplexUtils } from "./Complex";

export interface FunctionWithoutDerivative {
	names: string[];
	function: (input: number[]) => number;
	arguments: number;
}

export interface Function extends FunctionWithoutDerivative {
	derivative: (nodes: Node[]) => Node;
}

export type ExtraFunctionTypeBecauseOfStupidImports = Function

export const MathFunctions: Function[] = [
	//Trigonometric Functions
	{
		names: ["sin"],
		function: ([x]) => {
			return math.sin(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Function("cos", x);
		},
	},
	{
		names: ["cos"],
		function: ([x]) => {
			return math.cos(x);
		},
		arguments:
			1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Function("sin", x));
		},
	},
	{
		names: ["tan"],
		function: ([x]) => {
			return math.tan(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Exponentiation(BasicNodes.Function("sec", x), BasicNodes.Literal(2));
		},
	},
	{
		names: ["cot"],
		function: ([x]) => {
			return ExtendedMath.cot(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Exponentiation(BasicNodes.Function("csc", x), BasicNodes.Literal(2)));
		},
	},
	{
		names: ["sec"],
		function: ([x]) => {
			return ExtendedMath.sec(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Multiply(BasicNodes.Function("sec", x), BasicNodes.Function("tan", x));
		},
	},
	{
		names: ["csc"],
		function: ([x]) => {
			return ExtendedMath.csc(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Multiply(BasicNodes.Function("csc", x), BasicNodes.Function("cot", x)));
		},
	},
	{
		names: ["asin"],
		function: ([x]) => {
			return math.asin(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Divide(BasicNodes.Literal(1), BasicNodes.Exponentiation(
				BasicNodes.Subtract(BasicNodes.Literal(1), BasicNodes.Exponentiation(x, BasicNodes.Literal(2))),
				BasicNodes.Literal(ComplexUtils.fromNumbers(1, 2)),
			));
		},
	},
	{
		names: ["acos"],
		function: ([x]) => {
			return math.acos(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Divide(BasicNodes.Negative(BasicNodes.Literal(1)), BasicNodes.Exponentiation(
				BasicNodes.Subtract(BasicNodes.Literal(1), BasicNodes.Exponentiation(x, BasicNodes.Literal(2))),
				BasicNodes.Literal(ComplexUtils.fromNumbers(1, 2)),
			));
		},
	},
	{
		names: ["atan"],
		function: ([x]) => {
			return math.atan(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Divide(BasicNodes.Literal(1), BasicNodes.Add(BasicNodes.Exponentiation(x, BasicNodes.Literal(2)), BasicNodes.Literal(1)));
		},
	},

	//Hyperbolic Functions
	{
		names: ["sin"],
		function: ([x]) => {
			return math.sinh(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Function("cosh", x);
		},
	},
	{
		names: ["cosh"],
		function: ([x]) => {
			return math.cosh(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Function("sinh", x);
		},
	},
	{
		names: ["tanh"],
		function: ([x]) => {
			return math.tanh(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Exponentiation(BasicNodes.Function("sech", x), BasicNodes.Literal(2));
		},
	},
	{
		names: ["coth"],
		function: ([x]) => {
			return ExtendedMath.coth(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Exponentiation(BasicNodes.Function("csch", x), BasicNodes.Literal(2)));
		},
	},
	{
		names: ["sech"],
		function: ([x]) => {
			return ExtendedMath.sech(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Multiply(BasicNodes.Function("sech", x), BasicNodes.Function("tanh", x)));
		},
	},
	{
		names: ["csch"],
		function: ([x]) => {
			return ExtendedMath.csch(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Negative(BasicNodes.Multiply(BasicNodes.Function("csch", x), BasicNodes.Function("coth", x)));
		},
	},

	//Logarithms
	{
		names: ["ln"],
		function: ([x]) => {
			return math.log(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return BasicNodes.Divide(BasicNodes.Literal(1), x);
		},
	},
	{
		names: ["log"],
		function: ([x, base]) => {
			return math.log(x, base);
		},
		arguments: 2,
		derivative: ([x, base]) => {
			return BasicNodes.Divide(BasicNodes.Literal(1), BasicNodes.Multiply(x, BasicNodes.Function("ln", base)));
		},
	},
];

export const PostProcessorFunctions: { fn: Function, converter: (input: Node[]) => Node }[] = [
	{
		fn: {
			names: ["deg", "degrees", "toDeg", "toDegrees"],
			arguments: 1,
			function: () => 0,
			derivative: () => BasicNodes.Zero(),
		},
		converter: ([x]) => {
			return BasicNodes.Multiply(x, BasicNodes.Divide(BasicNodes.Literal(180), BasicNodes.Variable("pi")));
		},
	}, {
		fn: {
			names: ["rad", "radians", "toRad", "toRadians"],
			arguments: 1,
			function: () => 0,
			derivative: () => BasicNodes.Zero(),
		},
		converter: ([x]) => {
			return BasicNodes.Multiply(x, BasicNodes.Divide(BasicNodes.Variable("pi"), BasicNodes.Literal(180)));
		},
	}, {
		fn: {
			names: ["abs", "absolute"],
			arguments: 1,
			function: () => 0,
			derivative: () => BasicNodes.Zero(),
		},
		converter: ([x]) => {
			return BasicNodes.Absolute(x);
		},
	}, {
		fn: {
			names: ["vec", "vector"],
			arguments: 1,
			function: () => 0,
			derivative: () => BasicNodes.Zero(),
		},
		converter: (args) => {
			return BasicNodes.Vector(...args);
		},
	},
];