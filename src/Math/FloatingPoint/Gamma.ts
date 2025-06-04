export class GammaFunction {
	private static readonly coefficients = [
		0.99999999999980993,
		676.5203681218851,
		-1259.1392167224028,
		771.32342877765313,
		-176.61502916214059,
		12.507343278686905,
		-0.13857109526572012,
		9.9843695780195716e-6,
		1.5056327351493116e-7,
	];
	private static readonly g = 7;
	private static readonly sqrt2pi = math.sqrt(2 * math.pi);

	static gamma(z: number): number {
		if(z < 0.5) {
			return math.pi / (math.sin(math.pi * z) * this.gamma(1 - z));
		}

		z -= 1;
		let x = this.coefficients[0];

		for(let i = 1; i < this.coefficients.size(); i++) {
			x += this.coefficients[i] / (z + i);
		}

		const t = z + this.g + 0.5;
		return this.sqrt2pi * math.pow(t, z + 0.5) * math.exp(-t) * x;
	}
}