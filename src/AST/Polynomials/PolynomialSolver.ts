import { PolynomialInfo, PolynomialType } from "../../Typescript/Polynomials";
import { PolynomialAnalyzer } from "./PolynomialAnalyzer";
import { Error, ErrorType } from "../../Typescript/Error";
import { BasicNodes } from "../../Node/BasicNodes";
import { Node } from "../../Typescript/Node";
import { Nodes } from "../../Node/NodeUtils";

export class PolynomialSolver {
	private static GetCoefficient(polynomial: PolynomialInfo, variable: string, degree: number): Node {
		if(degree !== 0) {
			return PolynomialAnalyzer.GetCoefficient(
				polynomial.polynomial,
				new Map<string, number>().set(variable, degree),
			);
		} else {
			return PolynomialAnalyzer.GetCoefficient(
				polynomial.polynomial,
				new Map<string, number>(),
			);
		}
	}

	private static GetQuadraticCoefficients(polynomial: PolynomialInfo, variable: string) {
		if(polynomial.classification.type !== PolynomialType.Quadratic
			|| !polynomial.classification.isUnivariate) {
			return undefined;
		}
		return {
			a: this.GetCoefficient(polynomial, variable, 2),
			b: this.GetCoefficient(polynomial, variable, 1),
			c: this.GetCoefficient(polynomial, variable, 0),
		};
	}

	static SolveQuadratic(polynomial: PolynomialInfo, variable: string): [Node, Node] {
		const coefficients = this.GetQuadraticCoefficients(polynomial, variable);
		if(!coefficients) {
			throw new Error(ErrorType.Polynomial, {
				message: "Polynomial is not a quadratic or univariate",
				polynomial: polynomial,
			});
		}

		const D = Nodes.SquareRoot(Nodes.Subtract(
			Nodes.Square(coefficients.b),
			Nodes.Multiply(
				BasicNodes.Literal(4),
				coefficients.a,
				coefficients.c,
			),
		));
		const negativeB = Nodes.Negative(coefficients.b);
		const low = Nodes.Multiply(BasicNodes.Literal(2), coefficients.a);

		return [Nodes.Divide(
			Nodes.Add(negativeB, D),
			low,
		), Nodes.Divide(
			Nodes.Subtract(negativeB, D),
			low,
		)];
	}

	private static GetLinearCoefficients(polynomial: PolynomialInfo, variable: string) {
		if(polynomial.classification.type !== PolynomialType.Linear
			|| !polynomial.classification.isUnivariate) {
			return undefined;
		}
		return {
			a: this.GetCoefficient(polynomial, variable, 1),
			b: this.GetCoefficient(polynomial, variable, 0),
		};
	}

	static SolveLinear(polynomial: PolynomialInfo, variable: string): Node {
		const coefficients = this.GetLinearCoefficients(polynomial, variable);
		if(!coefficients) {
			throw new Error(ErrorType.Polynomial, {
				message: "Polynomial is not a linear or univariate",
				polynomial: polynomial,
			});
		}

		return Nodes.Divide(coefficients.b, coefficients.a);
	}
}