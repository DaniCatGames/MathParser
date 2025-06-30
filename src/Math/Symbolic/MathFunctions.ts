import { ExtendedMath } from "../FloatingPoint/ExtendedMath";

import { Node } from "../../Typescript/Node";
import { BasicNodes } from "../../Node/BasicNodes";
import { Nodes } from "../../Node/NodeUtils";

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
			return Nodes.Negative(BasicNodes.Function("sin", x));
		},
	},
	{
		names: ["tan"],
		function: ([x]) => {
			return math.tan(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Square(BasicNodes.Function("sec", x));
		},
	},
	{
		names: ["cot"],
		function: ([x]) => {
			return ExtendedMath.cot(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Negative(Nodes.Square(BasicNodes.Function("csc", x)));
		},
	},
	{
		names: ["sec"],
		function: ([x]) => {
			return ExtendedMath.sec(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Multiply(BasicNodes.Function("sec", x), BasicNodes.Function("tan", x));
		},
	},
	{
		names: ["csc"],
		function: ([x]) => {
			return ExtendedMath.csc(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Negative(Nodes.Multiply(BasicNodes.Function("csc", x), BasicNodes.Function("cot", x)));
		},
	},
	{
		names: ["asin"],
		function: ([x]) => {
			return math.asin(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Inverse(Nodes.SquareRoot(
				Nodes.Subtract(Nodes.One(), Nodes.Square(x)),
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
			return Nodes.Negative(Nodes.Inverse(Nodes.SquareRoot(
				Nodes.Subtract(Nodes.One(), Nodes.Square(x)),
			)));
		},
	},
	{
		names: ["atan"],
		function: ([x]) => {
			return math.atan(x);
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Inverse(Nodes.Add(Nodes.Square(x), Nodes.One()));
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
			return Nodes.Square(BasicNodes.Function("sech", x));
		},
	},
	{
		names: ["coth"],
		function: ([x]) => {
			return ExtendedMath.coth(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Negative(Nodes.Square(BasicNodes.Function("csch", x)));
		},
	},
	{
		names: ["sech"],
		function: ([x]) => {
			return ExtendedMath.sech(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Negative(Nodes.Multiply(BasicNodes.Function("sech", x), BasicNodes.Function("tanh", x)));
		},
	},
	{
		names: ["csch"],
		function: ([x]) => {
			return ExtendedMath.csch(x)[0];
		},
		arguments: 1,
		derivative: ([x]) => {
			return Nodes.Negative(Nodes.Multiply(BasicNodes.Function("csch", x), BasicNodes.Function("coth", x)));
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
			return Nodes.Inverse(x);
		},
	},
	{
		names: ["log"],
		function: ([x, base]) => {
			return math.log(x, base);
		},
		arguments: 2,
		derivative: ([x, base]) => {
			return Nodes.Inverse(Nodes.Multiply(x, BasicNodes.Function("ln", base)));
		},
	},
];

export const PostProcessorFunctions: { fn: FunctionWithoutDerivative, converter: (input: Node[]) => Node }[] = [
	{
		fn: {
			names: ["deg", "degrees", "toDeg", "toDegrees"],
			arguments: 1,
			function: () => 0,
		},
		converter: ([x]) => {
			return Nodes.Multiply(x, Nodes.Divide(BasicNodes.Literal(180), BasicNodes.Variable("pi")));
		},
	}, {
		fn: {
			names: ["rad", "radians", "toRad", "toRadians"],
			arguments: 1,
			function: () => 0,
		},
		converter: ([x]) => {
			return Nodes.Multiply(x, Nodes.Divide(BasicNodes.Variable("pi"), BasicNodes.Literal(180)));
		},
	}, {
		fn: {
			names: ["abs", "absolute"],
			arguments: 1,
			function: () => 0,
		},
		converter: ([x]) => {
			return BasicNodes.Absolute(x);
		},
	}, {
		fn: {
			names: ["vec", "vector"],
			arguments: 1,
			function: () => 0,
		},
		converter: (args) => {
			return BasicNodes.Vector(...args);
		},
	},
];