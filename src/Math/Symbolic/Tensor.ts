import { Node, Tensor } from "../../Typescript/Node";
import { Error, ErrorType } from "../../Typescript/Error";
import { BasicNodes } from "../../Node/BasicNodes";
import { Nodes } from "../../Node/NodeUtils";

export class TensorUtils {
	static getTotalElements(tensor: Tensor) {
		return tensor.shape.reduce((total, dim) => total * dim, 1);
	}

	static shapeToTotalElements(shape: number[]) {
		return shape.reduce((total, dim) => total * dim, 1);
	}

	static indicesToFlatIndex(indices: number[], shape: number[]) {
		if(indices.size() !== shape.size()) throw new Error(ErrorType.Tensor, {
			message: "Index dimension mismatch",
			indices: indices,
			tensorShape: shape,
		});

		let flatIndex = 0;
		let multiplier = 1;

		for(let i = shape.size() - 1; i >= 0; i--) {
			if(indices[i] >= shape[i] || indices[i] < 0) {
				throw new Error(ErrorType.Tensor, {
					message: `Index for dimension ${i} out of bounds`,
					index: indices[i],
					size: shape[i],
				});
			}

			flatIndex += indices[i] * multiplier;
			multiplier *= shape[i];
		}

		return flatIndex;
	}

	static flatIndexToIndices(flatIndex: number, shape: number[]): number[] {
		const indices: number[] = [];
		let remaining = flatIndex;

		for(let i = shape.size() - 1; i >= 0; i--) {
			const dim = shape[i];
			indices[i] = remaining % dim;
			remaining = math.floor(remaining / dim);
		}

		return indices;
	}

	static getElement(tensor: Tensor, indices: number[]): Node | undefined {
		try {
			const flatIndex = this.indicesToFlatIndex(indices, tensor.shape);
			return tensor.args[flatIndex];
		} catch {
			return undefined;
		}
	}

	static setElement(tensor: Tensor, indices: number[], value: Node): boolean {
		try {
			const flatIndex = this.indicesToFlatIndex(indices, tensor.shape);
			tensor.args[flatIndex] = value;
			return true;
		} catch {
			return false;
		}
	}

	static reshape(tensor: Tensor, shape: number[]): Tensor {
		const oldTotal = this.getTotalElements(tensor);
		const newTotal = shape.reduce((total, dim) => total * dim, 1);

		if(oldTotal !== newTotal) throw new Error(ErrorType.Tensor, {
			message: `Old tensor shape is not same size as new tensor shape`,
			oldShape: tensor.shape,
			oldSize: oldTotal,
			newShape: shape,
			newSize: newTotal,
		});

		return BasicNodes.Tensor([...tensor.args], [...shape]);
	};

	static shapeToString(shape: number[]): string {
		return `[${shape.join("x")}]`;
	}

	static tensorsCompatible(a: Tensor, b: Tensor): boolean {
		if(a.shape.size() !== b.shape.size()) return false;
		return a.shape.every((dim, i) => dim === b.shape[i]);
	}

	static multiply(a: Tensor, b: Node) {
		//TODO: guess wanted multiplication type
	}

	static elementAdd(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise addition",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultArgs: Node[] = [];
		for(let i = 0; i < a.args.size(); i++) {
			resultArgs.push(BasicNodes.Add(a.args[i], b.args[i]));
		}

		return BasicNodes.Tensor(resultArgs, [...a.shape]);
	}

	static elementSubtract(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise subtraction",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultArgs: Node[] = [];
		for(let i = 0; i < a.args.size(); i++) {
			resultArgs.push(BasicNodes.Subtract(a.args[i], b.args[i]));
		}

		return BasicNodes.Tensor(resultArgs, [...a.shape]);
	}

	static elementMultiply(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise multiplication",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultArgs: Node[] = [];
		for(let i = 0; i < a.args.size(); i++) {
			resultArgs.push(Nodes.Multiply(a.args[i], b.args[i]));
		}

		return BasicNodes.Tensor(resultArgs, [...a.shape]);
	}

	static elementDivide(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise division",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultArgs: Node[] = [];
		for(let i = 0; i < a.args.size(); i++) {
			resultArgs.push(BasicNodes.Divide(a.args[i], b.args[i]));
		}

		return BasicNodes.Tensor(resultArgs, [...a.shape]);
	}

	static scalarMultiply(tensor: Tensor, scalar: Tensor): Tensor {
		const resultArgs: Node[] = [];
		for(let i = 0; i < tensor.args.size(); i++) {
			resultArgs.push(Nodes.Multiply(tensor.args[i], scalar));
		}

		return BasicNodes.Tensor(resultArgs, [...tensor.shape]);
	}

	static matrixMultiplication(a: Tensor, b: Tensor): Tensor {
		if(a.shape.size() !== 2 || b.shape.size() !== 2) {
			throw new Error(ErrorType.Tensor, {
				message: "Matrix multiplication requires 2D tensors",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const [rowsA, colsA] = a.shape;
		const [rowsB, colsB] = a.shape;

		if(colsA !== rowsB) {
			throw new Error(ErrorType.Tensor, {
				message: "Invalid dimensions for matrix multiplication, columns of matrix A must equal rows of matrix B",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultArgs: Node[] = [];
		const resultShape = [rowsA, colsB];


		for(let i = 0; i < rowsA; i++) {
			for(let j = 0; j < colsB; j++) {
				const terms: Node[] = [];

				for(let k = 0; k < colsA; k++) {
					const aIndex = i * colsA + k;
					const bIndex = k * colsB + j;

					terms.push(Nodes.Multiply(a.args[aIndex], b.args[bIndex]));
				}

				if(terms.size() === 1) {
					resultArgs.push(terms[0]);
				} else {
					resultArgs.push(BasicNodes.Add(...terms));
				}
			}
		}

		return BasicNodes.Tensor(resultArgs, resultShape);
	}

	static vectorDot(a: Tensor, b: Tensor): Node {
		if(a.shape.size() !== 1 || b.shape.size() !== 1) {
			throw new Error(ErrorType.Tensor, {
				message: "Vector dot product requires 1D tensors",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		if(a.shape[0] !== b.shape[0]) {
			throw new Error(ErrorType.Tensor, {
				message: "Vectors must have same length for dot product",
				lengthA: a.shape[0],
				lengthB: b.shape[0],
			});
		}

		const resultArgs: Node[] = [];
		for(let i = 0; i < a.args.size(); i++) {
			resultArgs.push(Nodes.Multiply(a.args[i], b.args[i]));
		}

		if(resultArgs.size() === 1) {
			return resultArgs[0];
		} else {
			return BasicNodes.Add(...resultArgs);
		}
	}

	static transpose(tensor: Tensor, axes?: number[]): Tensor {
		if(tensor.shape.size() === 0) {
			return BasicNodes.Tensor([...tensor.args], [...tensor.shape]);
		}

		if(axes === undefined) {
			axes = [];
			for(let i = tensor.shape.size() - 1; i >= 0; i++) {
				axes.push(i);
			}
		}

		if(axes.size() !== tensor.shape.size()) {
			throw new Error(ErrorType.Tensor, {
				message: "Axes array must have same length as tensor rank",
				axesLength: axes.size(),
				tensorDimensions: tensor.shape.size(),
			});
		}

		const sorted = [...axes].sort();
		for(let i = 0; i < sorted.size(); i++) {
			if(sorted[i] !== i) {
				throw new Error(ErrorType.Tensor, {
					message: "Axes must be a permutation of tensor dimensions",
					axes: axes,
					tensorDimensions: tensor.shape.size(),
				});
			}
		}

		for(let i = 0; i < axes.size(); i++) {
			if(axes[i] < 0 || axes[i] >= tensor.shape.size()) {
				throw new Error(ErrorType.Tensor, {
					message: "Axis is out of bounds for tensor",
					axis: axes[i],
					tensorDimensions: tensor.shape.size(),
				});
			}
		}

		const newShape: number[] = [];
		const newArgs: Node[] = [];
		const totalElements = this.getTotalElements(tensor);

		for(let i = 0; i < tensor.shape.size(); i++) {
			newShape.push(tensor.shape[axes[i]]);
		}

		for(let flatIndex = 0; flatIndex < totalElements; flatIndex++) {
			const newIndices = this.flatIndexToIndices(flatIndex, newShape);

			const originalIndices: number[] = [];
			for(let i = 0; i < tensor.shape.size(); i++) {
				originalIndices.push(0);
			}

			for(let i = 0; i < axes.size(); i++) {
				originalIndices[axes[i]] = newIndices[i];
			}

			const element = this.getElement(tensor, originalIndices);

			if(element === undefined) {
				throw new Error(ErrorType.Tensor, {
					message: "Failed to get element",
					originalIndices: originalIndices,
					tensorShape: tensor.shape,
				});
			}

			newArgs.push(element);
		}

		return BasicNodes.Tensor(newArgs, newShape);
	}

	static identityMatrix(size: number): Tensor {
		const resultArgs: Node[] = [];
		const shape = [size, size];

		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				if(i === j) {
					resultArgs.push(Nodes.One());
				} else {
					resultArgs.push(Nodes.Zero());
				}
			}
		}

		return BasicNodes.Tensor(resultArgs, shape);
	}

	static zeros(shape: number[]): Tensor {
		const totalElements = this.shapeToTotalElements(shape);
		const resultArgs: Node[] = [];

		for(let i = 0; i < totalElements; i++) {
			resultArgs.push(Nodes.Zero());
		}

		return BasicNodes.Tensor(resultArgs, shape);
	}

	static ones(shape: number[]): Tensor {
		const totalElements = this.shapeToTotalElements(shape);
		const resultArgs: Node[] = [];

		for(let i = 0; i < totalElements; i++) {
			resultArgs.push(Nodes.One());
		}

		return BasicNodes.Tensor(resultArgs, shape);
	}

	static isVector(tensor: Tensor) {
		return tensor.shape.size() === 1;
	}

	static isMatrix(tensor: Tensor) {
		return tensor.shape.size() === 2;
	}

	static isTensor(tensor: Tensor) {
		return tensor.shape.size() >= 3;
	}
}