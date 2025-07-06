import { Node, NodeType } from "../Typescript/Node";
import { TensorUtils } from "../Math/Symbolic/Tensor";
import { FractionUtils } from "../Math/Symbolic/Fraction";
import { Fraction } from "../Typescript/Math";
import { slice } from "../Polyfill/Array";
import { BasicNodes } from "../Node/BasicNodes";

export class Visualizer {
	static String(node: Node): string {
		const String = this.ToString(node);
		return String.match("^%((.*)%)$")[0] as string || String;
	}

	private static ToString(node: Node): string {
		switch(node.type) {
			case NodeType.Literal:
				let LaTeX = "";
				LaTeX += this.StringFraction(node.number.real, false);

				if(!FractionUtils.IsZero(node.number.real) && !FractionUtils.IsZero(node.number.imaginary)) LaTeX += "+";

				LaTeX += this.StringFraction(node.number.imaginary, true);

				if(!FractionUtils.IsZero(node.number.real) && !FractionUtils.IsZero(node.number.imaginary)) LaTeX = `(${LaTeX})`;

				return LaTeX;
			case NodeType.Variable:
			case NodeType.Constant:
				return `${node.string}`;
			case NodeType.Add:
				return `(${node.args.map(arg => this.ToString(arg)).join("+")})`;
			case NodeType.Multiply:
				return `(${node.args.map(arg => this.ToString(arg)).join("*")})`;
			case NodeType.List:
				return `{${node.args.map(arg => this.ToString(arg)).join(", ")}}`;
			case NodeType.Tensor:
				if(TensorUtils.IsVector(node)) {
					return `[${node.args.map(arg => this.ToString(arg)).join(", ")}]`;
				} else {
					let indexOffset = 1;
					for(let i = 0; i < node.shape.size(); i++) {
						if(i !== 0) indexOffset *= node.shape[i];
					}

					let tensor = `[`;

					for(let j = 0; j < node.shape[0]; j++) {
						const args = slice(node.args, j * indexOffset, (j + 1) * indexOffset);
						const newShape = [...node.shape];
						newShape.remove(0);

						tensor += this.ToString(BasicNodes.Tensor(args, newShape));
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
		if(FractionUtils.IsZero(fraction)) {
			return "";
		} else if(FractionUtils.IsInteger(fraction)) {
			return `${fraction.numerator}${imaginary ? "i" : ""}`;
		} else {
			return `${fraction.numerator}/${fraction.denominator}${imaginary ? "i" : ""}`;
		}
	}
}