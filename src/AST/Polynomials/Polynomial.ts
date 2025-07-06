import { PolynomialAnalyzer } from "./PolynomialAnalyzer";
import { BasicNodes } from "../../Node/BasicNodes";
import { Node } from "../../Typescript/Node";
import { Polynomial, PolynomialTerm } from "../../Typescript/Polynomials";
import { Error, ErrorType } from "../../Typescript/Error";
import { Nodes, NodeTests } from "../../Node/NodeUtils";

export class PolynomialUtils {
	static Add(poly1: Polynomial, poly2: Polynomial) {
		const combined = [...poly1.terms, ...poly2.terms];
		return PolynomialAnalyzer.CreatePolynomial(
			this.CombineTerms(combined),
		);
	}

	static Subtract(poly1: Polynomial, poly2: Polynomial) {
		const negated: PolynomialTerm[] = poly2.terms.map(term => ({
			...term,
			coefficient: Nodes.Negative(term.coefficient),
		}));

		const combined = [...poly1.terms, ...negated];
		return PolynomialAnalyzer.CreatePolynomial(
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

		return PolynomialAnalyzer.CreatePolynomial(
			this.CombineTerms(result),
		);
	}

	static MultiplyScalar(poly: Polynomial, scalar: Node) {
		const scaledTerms = poly.terms.map(term => ({
			...term,
			coefficient: Nodes.Multiply(term.coefficient, scalar),
		}));

		return PolynomialAnalyzer.CreatePolynomial(scaledTerms);
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

			const polyFromQuoTerm = PolynomialAnalyzer.CreatePolynomial([quoTerm]);
			const toSubtract = this.Multiply(poly2, polyFromQuoTerm);
			rem = this.Subtract(rem, toSubtract);
		}

		const quo = quoTerms.size() > 0
			? PolynomialAnalyzer.CreatePolynomial(quoTerms)
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

		return this.ToMonic(a);
	}

	static Derivative(poly: Polynomial, variable: string = "x") {
		const terms: PolynomialTerm[] = [];

		poly.terms.forEach(term => {
			const derivative = this.TermDerivative(term, variable);
			if(derivative) terms.push(derivative);
		});

		return PolynomialAnalyzer.CreatePolynomial(terms);
	}

	private static TermDerivative(term: PolynomialTerm, variable: string): PolynomialTerm | undefined {
		const newVariables = new Map<string, number>;
		let coeff = term.coefficient;

		let hasVar = false;

		term.variables.forEach((power, vari) => {
			if(vari === variable) {
				coeff = Nodes.Divide(
					coeff,
					BasicNodes.Literal(power),
				);

				if(power > 1) newVariables.set(vari, power - 1);
				hasVar = true;
			} else {
				newVariables.set(vari, power);
			}
		});

		let degree = 0;
		newVariables.forEach(power => degree += power);

		if(hasVar) {
			return {
				coefficient: coeff,
				variables: newVariables,
				degree: degree,
			};
		} else {
			return undefined;
		}
	}

	static ToNode(poly: Polynomial) {
		const args = poly.terms.map(term => this.TermToNode(term));
		return Nodes.Add(...args);
	}

	static TermToNode(term: PolynomialTerm) {
		const args: Node[] = [term.coefficient];
		term.variables.forEach((power, variable) => {
			args.push(Nodes.Exponentiation(
				BasicNodes.Variable(variable),
				BasicNodes.Literal(power),
			));
		});
		return Nodes.Multiply(
			...args,
		);
	}

	static Constant(node: Node) {
		return PolynomialAnalyzer.CreatePolynomial([{
			coefficient: node,
			variables: new Map<string, number>(),
			degree: 0,
		}]);
	}

	static Zero() {
		return this.Constant(Nodes.Zero());
	}

	private static CombineTerms(terms: PolynomialTerm[]): PolynomialTerm[] {
		const map = new Map<string, PolynomialTerm>();

		terms.forEach((term) => {
			const signature = PolynomialAnalyzer.PowerSignature(term.variables);

			if(map.has(signature)) {
				const previous = map.get(signature) as PolynomialTerm;

				map.set(signature, {
					...previous,
					coefficient: Nodes.Add(previous.coefficient, term.coefficient),
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
		const newCoefficient = Nodes.Multiply(term1.coefficient, term2.coefficient);
		const newVariables = new Map<string, number>();

		const alreadyProcessed = new Set<string>();

		term1.variables.forEach((power, variable) => {
			newVariables.set(variable, power + (term2.variables.get(variable) || 0));
			alreadyProcessed.add(variable);
		});

		term2.variables.forEach((power, variable) => {
			if(!alreadyProcessed.has(variable)) {
				newVariables.set(variable, power);
			}
		});

		return this.RemoveZeroPowers({
			coefficient: newCoefficient,
			variables: newVariables,
			degree: term1.degree + term2.degree,
		});
	}

	private static DivideTerms(dividend: PolynomialTerm, divisor: PolynomialTerm): PolynomialTerm {
		const newCoeff = Nodes.Divide(dividend.coefficient, divisor.coefficient);
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

	static ToMonic(poly: Polynomial) {
		if(this.IsZero(poly)) return poly;

		const lead = poly.leadingCoefficient;

		return PolynomialAnalyzer.CreatePolynomial(
			poly.terms.map(term => ({
				...term,
				coefficient: Nodes.Divide(term.coefficient, lead),
			})),
		);
	}

	static RemoveZeroPowers<T extends Polynomial | PolynomialTerm>(poly: T): T {
		if("terms" in poly) {
			return PolynomialAnalyzer.CreatePolynomial(poly.terms.map(term => this.RemoveZeroPowers(term))) as T;
		} else {
			const newVariables = new Map<string, number>();
			poly.variables.forEach((power, variable) => {
				if(power !== 0) {
					newVariables.set(variable, power);
				}
			});

			return {
				...poly,
				variables: newVariables,
			};
		}
	}
}