import { Node, NodeType } from "../Typescript/Node";
import { TensorUtils } from "../Math/Symbolic/Tensor";

export class TensorParser {
	static analyzeTensorStructure(args: Node[]): { shape: number[], isValidTensor: boolean } {
		if(args.size() === 0) {
			return {shape: [0], isValidTensor: false};
		}

		const shape = this.calculateShape(args);
		const isValid = TensorUtils.validateTensorShape(args, shape, 0);

		return {shape, isValidTensor: isValid};
	}

	private static calculateShape(args: Node[]): number[] {
		const shape: number[] = [args.size()];

		if(args.size() > 0) {
			const firstElement = args[0];
			if(firstElement.type === NodeType.Tensor) {
				if(!firstElement) {
					shape.push(0);
				} else {
					const subShape = this.calculateShape(firstElement.args);
					subShape.forEach(x => shape.push(x));
				}
			}
		}

		return shape;
	}
}