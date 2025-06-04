import { Literal, NodeType } from "../Typescript/Node";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export class LiteralUtils {
	static addValues(...nodes: Literal[]): Literal {
		return {
			type: NodeType.Literal,
			number: nodes.map(node => node.number).reduce((acc, curr) => ComplexUtils.add(acc, curr)),
		};
	}

	static multiplyValues(...nodes: Literal[]): Literal {
		return {
			type: NodeType.Literal,
			number: nodes
				.map(node => node.number)
				.reduce((acc, curr) =>
					ComplexUtils.multiply(acc, curr)),
		};
	}
}