import { PostProcNode, PostProcType } from "../Typescript/Parsing";

export class TensorParser {
	static analyzeTensorStructure(args: PostProcNode[]): { shape: number[], isValidTensor: boolean } {
		if(args.size() === 0) {
			return {shape: [0], isValidTensor: false};
		}

		const shape = this.calculateShape(args);
		const isValid = this.validateTensorShape(args, shape, 0);

		return {shape, isValidTensor: isValid};
	}

	private static calculateShape(args: PostProcNode[]): number[] {
		const shape: number[] = [args.size()];

		if(args.size() > 0) {
			const firstElement = args[0];
			if(firstElement.type === PostProcType.Tensor) {
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

	private static validateTensorShape(args: PostProcNode[], expectedShape: number[], currentDepth: number): boolean {
		if(args.size() !== expectedShape[currentDepth]) {
			return false;
		}

		if(currentDepth === expectedShape.size() - 1) {
			return args.every(arg => arg.type !== PostProcType.Tensor);
		}

		return args.every(arg => {
			if(arg.type !== PostProcType.Tensor) return false;
			return this.validateTensorShape(
				arg.args,
				expectedShape,
				currentDepth + 1,
			);
		});
	}
}