import { PolynomialInfo, PolynomialType } from "../Typescript/Polynomials";
import { PolynomialAnalyzer } from "./PolynomialAnalyzer";
import { Error, ErrorType } from "../Typescript/Error";
import { BasicNodes } from "../Node/BasicNodes";
import { Node } from "../Typescript/Node";

export class PolynomialSolver {
	private static getCoefficient(polynomial: PolynomialInfo, variable: string, degree: number): Node {
		if(degree !== 0) {
			return PolynomialAnalyzer.getCoefficient(
				polynomial.polynomial,
				new Map<string, number>().set(variable, degree),
			);
		} else {
			return PolynomialAnalyzer.getCoefficient(
				polynomial.polynomial,
				new Map<string, number>(),
			);
		}
	}

	private static getQuadraticCoefficients(polynomial: PolynomialInfo, variable: string) {
		if(polynomial.classification.type !== PolynomialType.Quadratic
			|| !polynomial.classification.isUnivariate) {
			return undefined;
		}
		return {
			a: this.getCoefficient(polynomial, variable, 2),
			b: this.getCoefficient(polynomial, variable, 1),
			c: this.getCoefficient(polynomial, variable, 0),
		};
	}

	static solveQuadratic(polynomial: PolynomialInfo, variable: string): [Node, Node] {
		const coefficients = this.getQuadraticCoefficients(polynomial, variable);
		if(!coefficients) {
			throw new Error(ErrorType.Polynomial, {
				message: "Polynomial is not a quadratic or univariate",
				polynomial: polynomial,
			});
		}

		const D = BasicNodes.SquareRoot(BasicNodes.Subtract(
			BasicNodes.Square(coefficients.b),
			BasicNodes.Multiply(
				BasicNodes.Literal(4),
				coefficients.a,
				coefficients.c,
			),
		));
		const negativeB = BasicNodes.Negative(coefficients.b);
		const low = BasicNodes.Multiply(BasicNodes.Literal(2), coefficients.a);

		return [BasicNodes.Divide(
			BasicNodes.Add(negativeB, D),
			low,
		), BasicNodes.Divide(
			BasicNodes.Subtract(negativeB, D),
			low,
		)];
	}

	private static getLinearCoefficients(polynomial: PolynomialInfo, variable: string) {
		if(polynomial.classification.type !== PolynomialType.Linear
			|| !polynomial.classification.isUnivariate) {
			return undefined;
		}
		return {
			a: this.getCoefficient(polynomial, variable, 1),
			b: this.getCoefficient(polynomial, variable, 0),
		};
	}

	static solveLinear(polynomial: PolynomialInfo, variable: string): Node {
		const coefficients = this.getLinearCoefficients(polynomial, variable);
		if(!coefficients) {
			throw new Error(ErrorType.Polynomial, {
				message: "Polynomial is not a linear or univariate",
				polynomial: polynomial,
			});
		}

		return BasicNodes.Divide(coefficients.b, coefficients.a);
	}
}