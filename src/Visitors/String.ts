import { Visitor } from "./Visitor";
import {
	Absolute,
	Add,
	Constant,
	Equals,
	Exponentiation,
	Factorial,
	Function,
	List,
	Literal,
	Multiply,
	Tensor,
	Variable,
} from "../Typescript/Node";
import { FractionUtils } from "../Math/Symbolic/Fraction";
import { Fraction } from "../Typescript/Math";
import { TensorUtils } from "../Math/Symbolic/Tensor";
import { Error, ErrorType } from "../Typescript/Error";

export class LaTeXVisualizer extends Visitor<string> {
	constructor() {
		super();
	}

	VisitLiteral(node: Literal): string {
		if(FractionUtils.IsZero(node.number.real) && FractionUtils.IsZero(node.number.imaginary)) {
			return "0";
		} else if(!FractionUtils.IsZero(node.number.real) && FractionUtils.IsZero(node.number.imaginary)) {
			return `{${LaTeXFraction(node.number.real, false)}}`;
		} else if(FractionUtils.IsZero(node.number.real) && !FractionUtils.IsZero(node.number.imaginary)) {
			return `{${LaTeXFraction(node.number.imaginary, true)}}`;
		} else {
			return `{${LaTeXFraction(node.number.real, false)}+${LaTeXFraction(node.number.imaginary, true)}}`;
		}
	}

	VisitVariable(node: Variable): string {
		return `{${node.string}}`;
	}

	VisitConstant(node: Constant): string {
		return `{\\${node.string}}`;
	}

	VisitAdd(node: Add): string {
		return `{(${node.args.map(arg => this.Visit(arg)).join("+")})}`;
	}

	VisitMultiply(node: Multiply): string {
		return `{(${node.args.map(arg => this.Visit(arg)).join("\\cdot")})}`;
	}

	VisitExponentiation(node: Exponentiation): string {
		return `{${this.Visit(node.args[0])}^${this.Visit(node.args[1])}}`;
	}

	VisitList(node: List): string {
		return `{\\{${node.args.map(arg => this.Visit(arg)).join(", ")}\\}}`;
	}

	VisitFunction(node: Function): string {
		return `{(\\text{${node.string}}(${node.args.map(arg => this.Visit(arg)).join(", ")}))}`;
	}

	VisitFactorial(node: Factorial): string {
		return `{${this.Visit(node.args[0])}!}`;
	}

	VisitAbsolute(node: Absolute): string {
		return `{|${this.Visit(node.args[0])}|}`;
	}

	VisitEquals(node: Equals): string {
		return `{${node.args.map(arg => this.Visit(arg)).join("=")}}`;
	}

	VisitTensor(node: Tensor): string {
		if(node.shape.size() > 2) {
			throw new Error(ErrorType.Visualizer, {
				message: "Visualizer does not support tensors with >2 dimensions",
			});
		} else if(TensorUtils.IsMatrix(node)) {
			let matrix = `{\\begin{bmatrix}`;

			for(let i = 0; i < node.shape[0]; i++) {
				for(let j = 0; j < node.shape[1]; j++) {
					const item = TensorUtils.GetElement(node, [i, j]);
					if(!item) {
						throw new Error(ErrorType.Visualizer, {
							message: "Out of bounds",
							indices: [i, j],
							tensor: node,
						});
					}

					matrix += this.Visit(item);

					if(j !== node.shape[1] - 1) matrix += "&";
				}

				if(i !== node.shape[0] - 1) matrix += "\\\\";
			}

			return matrix + `\\end{bmatrix}}`;
		} else {
			let vector = `{\\begin{bmatrix}`;

			for(let i = 0; i < node.shape[1]; i++) {
				const item = TensorUtils.GetElement(node, [i, i]);
				if(!item) {
					throw new Error(ErrorType.Visualizer, {
						message: "Out of bounds",
						indices: [i, i],
						tensor: node,
					});
				}

				vector += this.Visit(item);

				if(i !== node.shape[1] - 1) vector += "&";
			}


			return vector + `\\end{bmatrix}}`;
		}
	}
}

function LaTeXFraction(fraction: Fraction, imaginary: boolean): string {
	if(FractionUtils.IsZero(fraction)) {
		return "0";
	} else if(FractionUtils.IsInteger(fraction)) {
		return `${fraction.numerator}${imaginary ? "i" : ""}`;
	} else {
		return `\\frac{${fraction.numerator}}{${fraction.denominator}}${imaginary ? "i" : ""}`;
	}
}