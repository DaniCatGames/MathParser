import { Literal, NodeType } from "../Typescript/Node";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export class LiteralUtils {
	static AddValues(...nodes: Literal[]): Literal {
		return {
			type: NodeType.Literal,
			number: nodes.map(node => node.number).reduce((acc, curr) => ComplexUtils.Add(acc, curr)),
		};
	}

	static MultiplyValues(...nodes: Literal[]): Literal {
		return {
			type: NodeType.Literal,
			number: nodes
				.map(node => node.number)
				.reduce((acc, curr) =>
					ComplexUtils.Multiply(acc, curr)),
		};
	}
}