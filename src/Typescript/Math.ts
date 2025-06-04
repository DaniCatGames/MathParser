export interface Fraction {
	numerator: number;
	denominator: number;
}

export interface Complex {
	real: Fraction;
	imaginary: Fraction;
}