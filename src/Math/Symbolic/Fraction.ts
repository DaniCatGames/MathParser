import { Fraction } from "../../Typescript/Math";

export class FractionUtils {
	static Gcd(a: number, b: number): number {
		a = math.abs(a);
		b = math.abs(b);
		while(b !== 0) {
			const temp = b;
			b = a % b;
			a = temp;
		}
		return a;
	}

	static Simplify(fraction: Fraction): Fraction {
		const divisor = this.Gcd(fraction.numerator, fraction.denominator);
		const sign = fraction.denominator < 0 ? -1 : 1;
		return {
			numerator: (fraction.numerator * sign) / divisor,
			denominator: (fraction.denominator * sign) / divisor,
		};
	}

	static Add(a: Fraction, b: Fraction): Fraction {
		return this.Simplify({
			numerator: a.numerator * b.denominator + b.numerator * a.denominator,
			denominator: a.denominator * b.denominator,
		});
	}

	static Subtract(a: Fraction, b: Fraction): Fraction {
		return this.Simplify({
			numerator: a.numerator * b.denominator - b.numerator * a.denominator,
			denominator: a.denominator * b.denominator,
		});
	}

	static Multiply(a: Fraction, b: Fraction): Fraction {
		return this.Simplify({
			numerator: a.numerator * b.numerator,
			denominator: a.denominator * b.denominator,
		});
	}

	static Divide(a: Fraction, b: Fraction): Fraction {
		return this.Simplify({
			numerator: a.numerator * b.denominator,
			denominator: a.denominator * b.numerator,
		});
	}

	static Zero(): Fraction {
		return {
			numerator: 0,
			denominator: 1,
		};
	}

	static One(): Fraction {
		return {
			numerator: 1,
			denominator: 1,
		};
	}

	static Equal(a: Fraction, b: Fraction): boolean {
		return (a.numerator === b.numerator && a.denominator === b.denominator);
	}

	static FractionFromNumber(value: number): Fraction {
		return this.Simplify({
			numerator: value,
			denominator: 1,
		});
	}

	static IsZero(fraction: Fraction) {
		return fraction.numerator === 0;
	}

	static IsInteger(fraction: Fraction) {
		return fraction.numerator % 1 === 0 && fraction.denominator === 1;
	}
}