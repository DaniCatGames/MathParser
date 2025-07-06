import {
	Polynomial,
	PolynomialClassification,
	PolynomialInfo,
	PolynomialStructure,
	PolynomialSymmetry,
	PolynomialTerm,
	PolynomialType,
	SpecialForm,
} from "../../Typescript/Polynomials";
import { Add, Exponentiation, Literal, Multiply, Node } from "../../Typescript/Node";
import { Nodes, NodeTests } from "../../Node/NodeUtils";
import { deDuplicate } from "../../Polyfill/Array";

export class PolynomialAnalyzer {
	static Analyze(node: Node): PolynomialInfo | undefined {
		const polynomial = this.Parse(node);
		if(!polynomial) return undefined;

		const classification = this.Classify(polynomial);
		const coefficients = this.GetCoefficients(polynomial);
		const structure = this.AnalyzeStructure(polynomial);

		return {
			polynomial: polynomial,
			classification: classification,
			coefficients: coefficients,
			structure: structure,
		};
	}


	// Parsing

	static Parse(node: Node): Polynomial | undefined {
		if(NodeTests.Add(node)) {
			return this.ParseAdd(node);
		} else {
			const term = this.ParseTerm(node);
			if(!term) return undefined;

			return this.CreatePolynomial([term]);
		}
	}

	private static ParseAdd(node: Add): Polynomial | undefined {
		if(!node.args) return undefined;

		const terms: PolynomialTerm[] = [];

		for(const arg of node.args) {
			const term = this.ParseTerm(arg);
			if(!term) return undefined;
			terms.push(term);
		}

		return this.CreatePolynomial(terms);
	}

	private static ParseTerm(node: Node): PolynomialTerm | undefined {
		if(NodeTests.Variable(node)) {
			return {
				coefficient: Nodes.One(),
				variables: new Map<string, number>().set(node.string, 1),
				degree: 1,
			};
		} else if(NodeTests.Literal(node)) {
			return {
				coefficient: node,
				variables: new Map<string, number>(),
				degree: 0,
			};
		} else if(NodeTests.Multiply(node)) {
			return this.ParseMultiply(node);
		} else if(NodeTests.Exponentiation(node)) {
			return this.ParseExponentiation(node);
		} else {
			return undefined;
		}
	};

	private static ParseMultiply(node: Multiply): PolynomialTerm | undefined {
		let coefficient: Node = Nodes.One();
		const variables = new Map<string, number>;

		for(const arg of node.args) {
			if(NodeTests.Literal(arg)) {
				coefficient = Nodes.Multiply(coefficient, arg);
			} else if(NodeTests.Variable(arg)) {
				const power = variables.get(arg.string) || 0;
				variables.set(arg.string, power + 1);
			} else if(NodeTests.Exponentiation(arg)) {
				const info = this.ParseExponentiationInfo(arg);
				if(!info) return undefined;

				const power = variables.get(info.variable) || 0;
				variables.set(info.variable, power + info.power);
			} else {
				return undefined;
			}
		}

		let degree = 0;
		variables.forEach(power => degree += power);

		return {
			coefficient: coefficient,
			variables: variables,
			degree: degree,
		};
	}

	private static ParseExponentiation(node: Exponentiation): PolynomialTerm | undefined {
		const info = this.ParseExponentiationInfo(node);
		if(!info) return undefined;

		const variables = new Map<string, number>();
		variables.set(info.variable, info.power);

		return {
			coefficient: Nodes.One(),
			variables: variables,
			degree: info.power,
		};
	}

	private static ParseExponentiationInfo(node: Exponentiation): { variable: string, power: number } | undefined {
		const base = node.args[0];
		const exp = node.args[1];

		if(!NodeTests.Variable(base)) return undefined;
		if(!NodeTests.Literal(exp)) return undefined;

		const power = this.ExtractInteger(exp);
		if(!power) return undefined;

		return {
			variable: base.string,
			power: power,
		};
	}

	static CreatePolynomial(terms: PolynomialTerm[]): Polynomial {
		const variables = new Set<string>();
		let maxDegree = 0;

		for(const term of terms) {
			term.variables.forEach((_, variable) => variables.add(variable));
			maxDegree = math.max(maxDegree, term.degree);
		}

		const leadingTerms = terms.filter(t => t.degree === maxDegree);
		const constantTerms = terms.filter(t => t.degree === 0);

		const leadingCoefficient = leadingTerms.size() > 0 ? leadingTerms[0].coefficient : Nodes.Zero();
		const constantTerm = constantTerms.size() > 0 ? constantTerms[0].coefficient : Nodes.Zero();

		return {
			terms: terms,
			variables: variables,
			degree: maxDegree,
			leadingCoefficient: leadingCoefficient,
			constantTerm: constantTerm,
			isHomogeneous: this.IsHomogeneous(terms),
			isMonomial: terms.size() === 1,
			isBinomial: terms.size() === 2,
			isTrinomial: terms.size() === 3,
		};
	}

	static IsHomogeneous(terms: PolynomialTerm[]): boolean {
		if(terms.size() === 0) return true;
		const degree = terms[0].degree;
		return terms.every(term => term.degree === degree);
	}

	private static ExtractInteger(node: Literal) {
		if(node.number.imaginary.numerator !== 0 || node.number.real.denominator !== 1) return undefined;
		const value = node.number.real.numerator;

		if(value % 1 === 0) return value;
		else return undefined;
	}


	// Classification

	static Classify(polynomial: Polynomial): PolynomialClassification {
		const polyType = this.GetType(polynomial.degree);
		const special = this.DetectSpecialForms(polynomial);

		let variables: string[] = [];
		for(const variable of polynomial.variables) {
			variables.push(variable);
		}
		variables = deDuplicate(variables);

		return {
			type: polyType,
			degree: polynomial.degree,
			variables: variables,
			isUnivariate: variables.size() === 1,
			isMultivariate: variables.size() > 1,
			specialForms: special,
		};
	}

	private static GetType(degree: number): PolynomialType {
		switch(degree) {
			case 0:
				return PolynomialType.Constant;
			case 1:
				return PolynomialType.Linear;
			case 2:
				return PolynomialType.Quadratic;
			case 3:
				return PolynomialType.Cubic;
			case 4:
				return PolynomialType.Quartic;
			case 5:
				return PolynomialType.Quintic;
			default:
				return PolynomialType.Higher;
		}
	}

	private static DetectSpecialForms(polynomial: Polynomial): SpecialForm[] {
		const forms: SpecialForm[] = [];

		if(polynomial.isHomogeneous) forms.push(SpecialForm.Homogeneous);
		if(polynomial.isBinomial) forms.push(SpecialForm.Binomial);
		if(polynomial.isTrinomial) forms.push(SpecialForm.Trinomial);

		// TODO: more special form checking (a^2 + 2ab + b^2 etc)

		return forms;
	}


	// Coefficients

	static GetCoefficient(polynomial: Polynomial, variablePowers: Map<string, number>): Node {
		const signature = this.PowerSignature(variablePowers);

		const term = polynomial.terms.find(term =>
			this.PowerSignature(term.variables) === signature,
		);

		if(term) {
			return term.coefficient;
		} else {
			return Nodes.Zero();
		}
	}

	static GetCoefficients(polynomial: Polynomial) {
		const coefficients = new Map<string, Node>;

		for(const term of polynomial.terms) {
			coefficients.set(this.PowerSignature(term.variables), term.coefficient);
		}

		return coefficients;
	}

	static PowerSignature(variables: Map<string, number>) {
		const temp = new Map<string, number>();
		variables.forEach((power, variable) => {
			temp.set(variable, (temp.get(variable) || 0) + power);
		});

		let str = "";
		temp.forEach((power, variable) => {
			str += `${variable}^${power}`;
		});

		return str;
	}


	// Analyze structure

	static AnalyzeStructure(polynomial: Polynomial): PolynomialStructure {
		const powers = polynomial.terms.map(term => term.degree).sort((a, b) => b > a);

		return {
			termCount: polynomial.terms.size(),
			powers: powers,
			hasConstantTerm: powers.includes(0),
			hasLinearTerm: powers.includes(1),
			hasQuadraticTerm: powers.includes(2),
			hasCubicTerm: powers.includes(3),
			symmetries: this.DetectSymmetries(polynomial),
		};
	}

	private static DetectSymmetries(polynomial: Polynomial): PolynomialSymmetry[] {
		const symmetries: PolynomialSymmetry[] = [];

		if(this.IsEvenFunction(polynomial)) symmetries.push(PolynomialSymmetry.Even);
		if(this.IsOddFunction(polynomial)) symmetries.push(PolynomialSymmetry.Odd);

		return symmetries;
	}

	private static IsEvenFunction(polynomial: Polynomial): boolean {
		if(polynomial.variables.size() === 1) {
			return polynomial.terms.every(term => term.degree % 2 === 0);
		}
		return false;
	}

	private static IsOddFunction(polynomial: Polynomial): boolean {
		if(polynomial.variables.size() === 1) {
			return polynomial.terms.every(term => term.degree % 2 === 1);
		}
		return false;
	}


	// Misc

	static GetTermsOfDegree(polynomial: Polynomial, degree: number): PolynomialTerm[] {
		return polynomial.terms.filter(term => term.degree === degree);
	}
}