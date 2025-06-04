import { Node, NodeType } from "../Typescript/Node";
import { TensorUtils } from "../Math/Symbolic/Tensor";
import { Error, ErrorType } from "../Typescript/Error";
import { FractionUtils } from "../Math/Symbolic/Fraction";
import { Fraction } from "../Typescript/Math";
import { slice } from "../Polyfill/Array";
import { BasicNodes } from "../Node/BasicNodes";

export class Visualizer {
	static LaTeX(node: Node): string {
		const LaTeX = this.ToLaTeX(node);
		return LaTeX.match("^%{%((.*)%)%}$")[0] as string || LaTeX;
	}

	private static ToLaTeX(node: Node): string {
		switch(node.type) {
			case NodeType.Literal:
				let LaTeX = `{`;
				LaTeX += this.LaTeXFraction(node.number.real, false);

				if(!FractionUtils.isZero(node.number.real) && !FractionUtils.isZero(node.number.imaginary)) LaTeX += "+";

				LaTeX += this.LaTeXFraction(node.number.imaginary, true);

				if(!FractionUtils.isZero(node.number.real) && !FractionUtils.isZero(node.number.imaginary)) LaTeX = `(${LaTeX})`;
				LaTeX += "}";
				return LaTeX;
			case NodeType.Constant:
			case NodeType.Variable:
				return `{${node.string}}`;
			case NodeType.Add:
				return `{(${node.args.map(arg => this.ToLaTeX(arg)).join("+")})}`;
			case NodeType.Multiply:
				return `{(${node.args.map(arg => this.ToLaTeX(arg)).join("\\cdot")})}`;
			case NodeType.List:
				return `{\\{${node.data.map(arg => this.ToLaTeX(arg)).join(", ")}\\}}`;
			case NodeType.Tensor:
				if(TensorUtils.isTensor(node)) {
					throw new Error(ErrorType.Visualizer, {
						message: "Visualizer does not support tensors with >2 dimensions",
					});
				} else if(TensorUtils.isMatrix(node)) {
					let matrix = `{\\begin{bmatrix}`;

					for(let i = 0; i < node.shape[0]; i++) {
						for(let j = 0; j < node.shape[1]; j++) {
							const item = TensorUtils.getElement(node, [i, j]);
							if(!item) {
								throw new Error(ErrorType.Visualizer, {
									message: "Out of bounds",
									indices: [i, j],
									tensor: node,
								});
							}

							matrix += this.ToLaTeX(item);

							if(j !== node.shape[1] - 1) matrix += "&";
						}

						if(i !== node.shape[0] - 1) matrix += "\\\\";
					}

					return matrix += `\\end{bmatrix}}`;
				} else {
					let vector = `{\\begin{bmatrix}`;

					for(let i = 0; i < node.shape[1]; i++) {
						const item = TensorUtils.getElement(node, [i, i]);
						if(!item) {
							throw new Error(ErrorType.Visualizer, {
								message: "Out of bounds",
								indices: [i, i],
								tensor: node,
							});
						}

						vector += this.ToLaTeX(item);

						if(i !== node.shape[1] - 1) vector += "&";
					}


					return vector += `\\end{bmatrix}}`;
				}
			case NodeType.Exponentiation:
				return `{${this.ToLaTeX(node.args[0])}^${this.ToLaTeX(node.args[1])}}`;
			case NodeType.Function:
				return `{(\\text{${node.string}}(${node.args.map(arg => this.ToLaTeX(arg)).join(", ")}))}`;
			case NodeType.Factorial:
				return `{(${this.ToLaTeX(node.args[0])}!)}`;
			case NodeType.Absolute:
				return `{|${this.ToLaTeX(node.args[0])}|}`;
			case NodeType.Equals:
				return `{(${this.ToLaTeX(node.args[0])}=${this.ToLaTeX(node.args[1])})}`;
		}
	}

	private static LaTeXFraction(fraction: Fraction, imaginary: boolean): string {
		if(FractionUtils.isZero(fraction)) {
			return "";
		} else if(FractionUtils.isInteger(fraction)) {
			return `${fraction.numerator}${imaginary ? "i" : ""}`;
		} else {
			return `\\frac{${fraction.numerator}}{${fraction.denominator}}${imaginary ? "i" : ""}`;
		}
	}

	static String(node: Node): string {
		const String = this.ToString(node);
		return String.match("^%((.*)%)$")[0] as string || String;
	}

	private static ToString(node: Node): string {
		switch(node.type) {
			case NodeType.Literal:
				let LaTeX = "";
				LaTeX += this.StringFraction(node.number.real, false);

				if(!FractionUtils.isZero(node.number.real) && !FractionUtils.isZero(node.number.imaginary)) LaTeX += "+";

				LaTeX += this.StringFraction(node.number.imaginary, true);

				if(!FractionUtils.isZero(node.number.real) && !FractionUtils.isZero(node.number.imaginary)) LaTeX = `(${LaTeX})`;

				return LaTeX;
			case NodeType.Constant:
			case NodeType.Variable:
				return `${node.string}`;
			case NodeType.Add:
				return `(${node.args.map(arg => this.ToString(arg)).join("+")})`;
			case NodeType.Multiply:
				return `(${node.args.map(arg => this.ToString(arg)).join("*")})`;
			case NodeType.List:
				return `{${node.data.map(arg => this.ToString(arg)).join(", ")}}`;
			case NodeType.Tensor:
				if(TensorUtils.isVector(node)) {
					return `[${node.data.map(arg => this.ToString(arg)).join(", ")}]`;
				} else {
					let indexOffset = 1;
					for(let i = 0; i < node.shape.size(); i++) {
						if(i !== 0) indexOffset *= node.shape[i];
					}

					let tensor = `[`;

					for(let j = 0; j < node.shape[0]; j++) {
						const data = slice(node.data, j * indexOffset, (j + 1) * indexOffset);
						const newShape = [...node.shape];
						newShape.remove(0);

						tensor += this.ToString(BasicNodes.Tensor(data, newShape));
						if(j !== node.shape[0] - 1) tensor += ", ";
					}

					return tensor += `]`;
				}
			case NodeType.Exponentiation:
				return `${this.ToString(node.args[0])}^${this.ToString(node.args[1])}`;
			case NodeType.Function:
				return `(${node.string}(${node.args.map(arg => this.ToString(arg)).join(", ")}))`;
			case NodeType.Factorial:
				return `(${this.ToString(node.args[0])}!)`;
			case NodeType.Absolute:
				return `|${this.ToString(node.args[0])}|`;
			case NodeType.Equals:
				return `${this.ToString(node.args[0])}=${this.ToString(node.args[1])}`;
		}
	}

	private static StringFraction(fraction: Fraction, imaginary: boolean): string {
		if(FractionUtils.isZero(fraction)) {
			return "";
		} else if(FractionUtils.isInteger(fraction)) {
			return `${fraction.numerator}${imaginary ? "i" : ""}`;
		} else {
			return `${fraction.numerator}/${fraction.denominator}${imaginary ? "i" : ""}`;
		}
	}
}