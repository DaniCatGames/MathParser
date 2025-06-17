import { Function } from "../Math/Symbolic/MathFunctions";

interface Plugin {
	functions: Function[];
	constants: { [key: string]: number };
}

export const Plugins: { [key: string]: Plugin } = {
	PHYSICS: {
		functions: [],
		constants: {
			c: 299792458,
			h: 6.626e-34,
			G: 6.674e-11,
			eV: 1.602e-19,
			k: 1.381e-23,
			NA: 6.022e23,
			me: 9.109e-31,
			mp: 1.673e-27,
			sigma: 5.670e-8,
			R: 8.314,
		},
	},
	CONVERSION: {
		functions: [],
		constants: {},
	},
};