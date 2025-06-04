import { Node } from "./Node";

export interface PolynomialTerm {
	coefficient: Node;
	variables: Map<string, number>;
	degree: number;
}

export interface Polynomial {
	terms: PolynomialTerm[];
	variables: Set<string>;
	degree: number;
	leadingCoefficient: Node;
	constantTerm: Node;
	isHomogeneous: boolean;
	isMonomial: boolean;
	isBinomial: boolean;
	isTrinomial: boolean;
}

export interface PolynomialInfo {
	polynomial: Polynomial;
	classification: PolynomialClassification;
	coefficients: Map<string, Node>; // power signature -> coefficient
	structure: PolynomialStructure;
}

export interface PolynomialClassification {
	type: PolynomialType;
	degree: number;
	variables: string[];
	isUnivariate: boolean;
	isMultivariate: boolean;
	specialForms: SpecialForm[];
}

export interface PolynomialStructure {
	termCount: number;
	powers: number[];
	hasConstantTerm: boolean;
	hasLinearTerm: boolean;
	hasQuadraticTerm: boolean;
	hasCubicTerm: boolean;
	symmetries: PolynomialSymmetry[];
}

export enum PolynomialType {
	Constant,
	Linear,
	Quadratic,
	Cubic,
	Quartic,
	Quintic,
	Higher
}

export enum SpecialForm {
	PerfectSquare,
	DifferenceOfSquares,
	SumOfCubes,
	DifferenceOfCubes,
	PerfectCube,
	Binomial,
	Trinomial,
	Homogeneous,
	Symmetric,
	Palindromic
}

export enum PolynomialSymmetry {
	Even,
	Odd,
	Palindromic,
	Reciprocal
}