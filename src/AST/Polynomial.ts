import { PolynomialAnalyzer } from "./PolynomialAnalyzer";
import { BasicNodes } from "../Node/BasicNodes";
import { Node } from "../Typescript/Node";
import { Polynomial, PolynomialTerm } from "../Typescript/Polynomials";
import { Error, ErrorType } from "../Typescript/Error";
import { flattenAST } from "../Parse/PostProcessor";
import { NodeTests } from "../Node/NodeUtils";
import { Calculus } from "./Calculus";

export class PolynomialUtils {
	static Add(poly1: Polynomial, poly2: Polynomial) {
		const combined = [...poly1.terms, ...poly2.terms];
		return PolynomialAnalyzer.createPolynomial(
			this.CombineTerms(combined),
		);
	}

	static Subtract(poly1: Polynomial, poly2: Polynomial) {
		const negated: PolynomialTerm[] = poly2.terms.map(term => ({
			...term,
			coefficient: BasicNodes.Negative(term.coefficient),
		}));

		const combined = [...poly1.terms, ...negated];
		return PolynomialAnalyzer.createPolynomial(
			this.CombineTerms(combined),
		);
	}

	static Multiply(poly1: Polynomial, poly2: Polynomial) {
		const result: PolynomialTerm[] = [];

		for(const term1 of poly1.terms) {
			for(const term2 of poly2.terms) {
				const newTerm = this.MultiplyTerms(term1, term2);
				result.push(newTerm);
			}
		}

		return PolynomialAnalyzer.createPolynomial(
			this.CombineTerms(result),
		);
	}

	static MultiplyScalar(poly: Polynomial, scalar: Node) {
		const scaledTerms = poly.terms.map(term => ({
			...term,
			coefficient: BasicNodes.Multiply(term.coefficient, scalar),
		}));

		return PolynomialAnalyzer.createPolynomial(scaledTerms);
	}

	static Divide(poly1: Polynomial, poly2: Polynomial) {
		if(this.IsZero(poly2)) {
			throw new Error(ErrorType.Polynomial, {
				message: "Dividing by a zero polynomial is not possible",
				poly1: poly1,
				poly2: poly2,
			});
		}

		let rem = poly1;
		const quoTerms: PolynomialTerm[] = [];

		while(!this.IsZero(rem) && rem.degree >= poly2.degree) {
			const leadingTermRem = this.LeadingTerm(rem);
			const leadingTermDiv = this.LeadingTerm(poly2);

			const quoTerm = this.DivideTerms(leadingTermRem, leadingTermDiv);
			quoTerms.push(quoTerm);

			const polyFromQuoTerm = PolynomialAnalyzer.createPolynomial([quoTerm]);
			const toSubtract = this.Multiply(poly2, polyFromQuoTerm);
			rem = this.Subtract(rem, toSubtract);
		}

		const quo = quoTerms.size() > 0
			? PolynomialAnalyzer.createPolynomial(quoTerms)
			: this.Zero();

		return {
			quotient: quo,
			remainder: rem,
		};
	}

	static Exponentiation(poly: Polynomial, exponent: number) {
		if(exponent % 1 !== 0) {
			throw new Error(ErrorType.Polynomial, {
				message: "Exponent is not an integer",
				exponent: exponent,
			});
		}
		if(exponent < 0) {
			throw new Error(ErrorType.Polynomial, {
				message: "Negative exponents not supported for polynomial exponents",
				exponent: exponent,
			});
		}

		if(exponent === 0) return this.Zero();
		if(exponent === 1) return poly;

		let result = poly;
		for(let i = 1; i < exponent; i++) {
			result = this.Multiply(result, poly);
		}
		return result;
	}

	static GCD(poly1: Polynomial, poly2: Polynomial) {
		let a = poly1;
		let b = poly2;

		while(!this.IsZero(b)) {
			const {remainder} = this.Divide(a, b);
			a = b;
			b = remainder;
		}

		return this.toMonic(a);
	}

	static Derivative(poly: Polynomial, variable: string = "x") {
		const node = this.ToNode(poly);
		return PolynomialAnalyzer.parse(Calculus.derivative(node, variable));
	}

	static ToNode(poly: Polynomial) {
		const args = poly.terms.map(term => this.TermToNode(term));
		return BasicNodes.Add(...args);
	}

	static TermToNode(term: PolynomialTerm) {
		const args: Node[] = [term.coefficient];
		term.variables.forEach((power, variable) => {
			args.push(BasicNodes.Exponentiation(
				BasicNodes.Variable(variable),
				BasicNodes.Literal(power),
			));
		});
		return BasicNodes.Multiply(
			...args,
		);
	}

	static Constant(node: Node) {
		return PolynomialAnalyzer.createPolynomial([{
			coefficient: node,
			variables: new Map<string, number>(),
			degree: 0,
		}]);
	}

	static Zero() {
		this.Constant(BasicNodes.Zero());
	}

	private static CombineTerms(terms: PolynomialTerm[]): PolynomialTerm[] {
		const map = new Map<string, PolynomialTerm>();

		terms.forEach((term) => {
			const signature = PolynomialAnalyzer.powerSignature(term.variables);

			if(map.has(signature)) {
				const previous = map.get(signature) as PolynomialTerm;

				map.set(signature, {
					...previous,
					coefficient: flattenAST(BasicNodes.Add(previous.coefficient, term.coefficient)),
				});
			} else {
				map.set(signature, term);
			}
		});

		const arr: PolynomialTerm[] = [];
		map.forEach((polynomialTerm) => {
			arr.push(polynomialTerm);
		});
		return arr;
	}

	private static MultiplyTerms(term1: PolynomialTerm, term2: PolynomialTerm): PolynomialTerm {
		const newCoefficient = BasicNodes.Multiply(term1.coefficient, term2.coefficient);
		const newVariables = new Map<string, number>();

		const allVariables = new Set<string>();
		term1.variables.forEach((_, variable) => {
			allVariables.add(variable);
		});
		term2.variables.forEach((_, variable) => {
			allVariables.add(variable);

		});

		for(const variable of allVariables) {
			const power1 = term1.variables.get(variable) || 0;
			const power2 = term2.variables.get(variable) || 0;
			const newPower = power1 + power2;

			if(newPower > 0) {
				newVariables.set(variable, newPower);
			}
		}

		return {
			coefficient: newCoefficient,
			variables: newVariables,
			degree: term1.degree + term2.degree,
		};
	}

	private static DivideTerms(dividend: PolynomialTerm, divisor: PolynomialTerm): PolynomialTerm {
		const newCoeff = BasicNodes.Divide(dividend.coefficient, divisor.coefficient);
		const newVars = new Map<string, number>();

		for(const [variable, dividendPower] of dividend.variables) {
			const divisorPower = divisor.variables.get(variable) || 0;
			const newPower = dividendPower - divisorPower;

			if(newPower > 0) {
				newVars.set(variable, newPower);
			} else if(newPower < 0) {
				throw new Error(ErrorType.Polynomial, {
					message: "Cannot divide polynomials, divisor has higher power",
					variable: variable,
					dividendPower: dividendPower,
					divisorPower: divisorPower,
				});
			}
		}

		const newDegree = dividend.degree - divisor.degree;

		return {
			coefficient: newCoeff,
			variables: newVars,
			degree: newDegree,
		};
	}

	static IsZero(poly: Polynomial) {
		return poly.terms.size() === 0 || poly.terms.every(term => NodeTests.Zero(term.coefficient));
	}

	static LeadingTerm(poly: Polynomial) {
		return poly.terms.find(term => term.degree === poly.degree)!;
	}

	static toMonic(poly: Polynomial) {
		if(this.IsZero(poly)) return poly;

		const lead = poly.leadingCoefficient;

		return PolynomialAnalyzer.createPolynomial(
			poly.terms.map(term => ({
				...term,
				coefficient: BasicNodes.Divide(term.coefficient, lead),
			})),
		);
	}
}