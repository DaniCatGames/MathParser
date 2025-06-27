import { Complex } from "../../Typescript/Math";
import { FractionUtils } from "./Fraction";

export class ComplexUtils {
	static add(a: Complex, b: Complex): Complex {
		return {
			real: FractionUtils.Add(a.real, b.real),
			imaginary: FractionUtils.Add(a.imaginary, b.imaginary),
		};
	}

	static subtract(a: Complex, b: Complex): Complex {
		return {
			real: FractionUtils.Subtract(a.real, b.real),
			imaginary: FractionUtils.Subtract(a.imaginary, b.imaginary),
		};
	}

	static multiply(a: Complex, b: Complex): Complex {
		const ac = FractionUtils.Multiply(a.real, b.real);
		const bd = FractionUtils.Multiply(a.imaginary, b.imaginary);
		const ad = FractionUtils.Multiply(a.real, b.imaginary);
		const bc = FractionUtils.Multiply(a.imaginary, b.real);

		return {
			real: FractionUtils.Subtract(ac, bd),
			imaginary: FractionUtils.Add(ad, bc),
		};
	}

	static divide(a: Complex, b: Complex): Complex {
		const numeratorReal = FractionUtils.Add(
			FractionUtils.Multiply(a.real, b.real),
			FractionUtils.Multiply(a.imaginary, b.imaginary),
		);
		const numeratorComplex = FractionUtils.Subtract(
			FractionUtils.Multiply(a.imaginary, b.real),
			FractionUtils.Multiply(a.real, b.imaginary),
		);
		const denominator = FractionUtils.Add(
			FractionUtils.Multiply(b.real, b.real),
			FractionUtils.Multiply(b.imaginary, b.imaginary),
		);

		return {
			real: FractionUtils.Divide(numeratorReal, denominator),
			imaginary: FractionUtils.Divide(numeratorComplex, denominator),
		};
	}

	static equal(a: Complex, b: Complex): boolean {
		return FractionUtils.equal(a.real, b.real) && FractionUtils.equal(a.imaginary, b.imaginary);
	}

	static fromNumber(real: number, imaginary: number = 0): Complex {
		return {
			real: {
				numerator: real,
				denominator: 1,
			},
			imaginary: {
				numerator: imaginary,
				denominator: 1,
			},
		};
	}

	static fromNumbers(realNom: number, realDenom: number, imagNom: number = 0, imagDenom: number = 1): Complex {
		return {
			real: {
				numerator: realNom,
				denominator: realDenom,
			},
			imaginary: {
				numerator: imagNom,
				denominator: imagDenom,
			},
		};
	}

	static zero() {
		return this.fromNumber(0);
	}
}