import { NodeType } from "../Typescript/Node";
import { DetectionNode, Pattern, SpecialNode } from "../Typescript/Match";
import { ComplexUtils } from "../Math/Symbolic/Complex";


function specialNode(node: Pattern, special: SpecialNode): Pattern {
	return node.map(detectionNode => ({...detectionNode, specialNode: special}));
}

function detectionNode<T extends NodeType>(node: DetectionNode<T>): DetectionNode<T> {
	return node;
}


function Add(...nodes: Pattern[]) {
	return [detectionNode({
		type: NodeType.Add,
		args: nodes,
		commutative: true,
	})];
}

function Subtract(a: Pattern, b: Pattern) {
	return [detectionNode({
		type: NodeType.Add,
		args: [a, Negative(b)],
		commutative: true,
	})];
}

function Multiply(...nodes: Pattern[]) {
	return [detectionNode({
		type: NodeType.Multiply,
		args: nodes,
		commutative: true,
	})];
}

function Divide(a: Pattern, b: Pattern) {
	return [detectionNode({
		type: NodeType.Multiply,
		args: [a, Exponentiation(b, Negative(b))],
		commutative: true,
	})];
}

function Exponentiation(a: Pattern, b: Pattern) {
	return [detectionNode({
		type: NodeType.Exponentiation,
		args: [a, b],
	})];
}

function Negative(node: Pattern) {
	return Multiply(node, NegativeOne);
}


const Variable = [detectionNode({type: NodeType.Variable})];


const Zero = [detectionNode({type: NodeType.Literal, number: ComplexUtils.fromNumber(0)})];
const One = [detectionNode({type: NodeType.Literal, number: ComplexUtils.fromNumber(1)})];
const NegativeOne = [detectionNode({type: NodeType.Literal, number: ComplexUtils.fromNumber(-1)})];


const Integers = [detectionNode({
	type: NodeType.Literal,
	conditions: [
		(node) => (node.number.real.denominator === 1),
		(node) => ((node.number.real.numerator % 1) === 0),
		(node) => (node.number.imaginary.denominator === 1),
		(node) => (node.number.imaginary.numerator === 0),
	],
})];

const PositiveIntegers = [detectionNode({
	...Integers[0],
	conditions: [...(Integers[0].conditions || []),
		(node) => (node.number.real.numerator >= 0)],
})];

const NegativeIntegers = [detectionNode({
	...Integers[0],
	conditions: [...(Integers[0].conditions || []),
		(node) => (node.number.real.numerator < 0)],
})];


const Rationals = [detectionNode({
	type: NodeType.Literal,
	conditions: [
		(node) => node.number.imaginary.numerator === 0,
		(node) => node.number.imaginary.denominator === 1],
})];

const PositiveRationals = [detectionNode({
	...Rationals[0],
	conditions: [...(Rationals[0].conditions || []),
		(node) => (node.number.imaginary.numerator >= 0)],
})];

const NegativeRationals = [detectionNode({
	...Rationals[0],
	conditions: [...(Rationals[0].conditions || []),
		(node) => (node.number.imaginary.numerator < 0)],
})];


const Reals = [detectionNode({
	type: NodeType.Literal,
	conditions: [
		(node) => node.number.imaginary.numerator === 0,
		(node) => node.number.imaginary.denominator === 1],
})];

const PositiveReals = [detectionNode({
	...Reals[0],
	conditions: [...(Reals[0].conditions || []),
		(node) => (node.number.real.numerator >= 0)],
})];

const NegativeReals = [detectionNode({
	...Reals[0],
	conditions: [...(Reals[0].conditions || []),
		(node) => (node.number.real.numerator < 0)],
})];


const Imaginaries = [detectionNode({
	type: NodeType.Literal,
	conditions: [
		(node) => node.number.real.numerator === 0,
		(node) => node.number.real.denominator === 1,
		(node) => node.number.imaginary.numerator !== 0],
})];

const PositiveImaginaries = [detectionNode({
	...Imaginaries[0],
	conditions: [...(Imaginaries[0].conditions || []),
		(node) => (node.number.imaginary.numerator >= 0)],
})];

const NegativeImaginaries = [detectionNode({
	...Imaginaries[0],
	conditions: [...(Imaginaries[0].conditions || []),
		(node) => (node.number.imaginary.numerator < 0)],
})];


const Complex = [detectionNode({
	type: NodeType.Literal,
	conditions: [
		(node) => node.number.real.numerator !== 0,
		(node) => node.number.imaginary.numerator !== 0],
})];
const AllComplex = [detectionNode({
	type: NodeType.Literal,
})];

const Literal = [detectionNode({type: NodeType.Literal})];


const Wildcard = [{}];


const SpecialNodeFunctions = {
	P: (node: Pattern) => specialNode(node, SpecialNode.P),
	Q: (node: Pattern) => specialNode(node, SpecialNode.Q),
	R: (node: Pattern) => specialNode(node, SpecialNode.R),
	S: (node: Pattern) => specialNode(node, SpecialNode.S),
};

const SpecialNodes = {
	P: SpecialNodeFunctions.P(Wildcard),
	Q: SpecialNodeFunctions.Q(Wildcard),
	R: SpecialNodeFunctions.R(Wildcard),
	S: SpecialNodeFunctions.S(Wildcard),
};


export const PatternFunctions = {
	Add,
	Subtract,
	Multiply,
	Divide,
	Exponentiation,
	Negative,

	P: SpecialNodeFunctions.P,
	Q: SpecialNodeFunctions.Q,
	R: SpecialNodeFunctions.R,
	S: SpecialNodeFunctions.S,
};

export const Patterns = {
	Integers,
	PositiveIntegers,
	NegativeIntegers,

	Rationals,
	PositiveRationals,
	NegativeRationals,

	Reals,
	PositiveReals,
	NegativeReals,

	Imaginaries,
	PositiveImaginaries,
	NegativeImaginaries,

	Complex,
	AllComplex,

	Literal,

	Zero,
	One,
	NegativeOne,
	Wildcard,
	Variable,

	SpecialNodes,
};