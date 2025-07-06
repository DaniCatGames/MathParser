import { Node, NodeType } from "../Typescript/Node";
import { TensorUtils } from "../Math/Symbolic/Tensor";

export class TensorParser {
	static AnalyzeTensorStructure(args: Node[]): { shape: number[], isValidTensor: boolean } {
		if(args.size() === 0) {
			return {shape: [0], isValidTensor: false};
		}

		const shape = this.CalculateShape(args);
		const isValid = TensorUtils.ValidateTensorShape(args, shape, 0);

		return {shape, isValidTensor: isValid};
	}

	private static CalculateShape(args: Node[]): number[] {
		const shape: number[] = [args.size()];

		if(args.size() > 0) {
			const firstElement = args[0];
			if(firstElement.type === NodeType.Tensor) {
				if(!firstElement) {
					shape.push(0);
				} else {
					const subShape = this.CalculateShape(firstElement.args);
					subShape.forEach(x => shape.push(x));
				}
			}
		}

		return shape;
	}
}