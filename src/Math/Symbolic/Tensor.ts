import { Node, Tensor } from "../../Typescript/Node";
import { Error, ErrorType } from "../../Typescript/Error";
import { BasicNodes } from "../../Node/BasicNodes";

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
			return tensor.data[flatIndex];
		} catch {
			return undefined;
		}
	}

	static setElement(tensor: Tensor, indices: number[], value: Node): boolean {
		try {
			const flatIndex = this.indicesToFlatIndex(indices, tensor.shape);
			tensor.data[flatIndex] = value;
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

		return BasicNodes.Tensor([...tensor.data], [...shape]);
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

		const resultData: Node[] = [];
		for(let i = 0; i < a.data.size(); i++) {
			resultData.push(BasicNodes.Add(a.data[i], b.data[i]));
		}

		return BasicNodes.Tensor(resultData, [...a.shape]);
	}

	static elementSubtract(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise subtraction",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultData: Node[] = [];
		for(let i = 0; i < a.data.size(); i++) {
			resultData.push(BasicNodes.Subtract(a.data[i], b.data[i]));
		}

		return BasicNodes.Tensor(resultData, [...a.shape]);
	}

	static elementMultiply(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise multiplication",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultData: Node[] = [];
		for(let i = 0; i < a.data.size(); i++) {
			resultData.push(BasicNodes.Multiply(a.data[i], b.data[i]));
		}

		return BasicNodes.Tensor(resultData, [...a.shape]);
	}

	static elementDivide(a: Tensor, b: Tensor): Tensor {
		if(!this.tensorsCompatible(a, b)) {
			throw new Error(ErrorType.Tensor, {
				message: "Tensors must have compatible shapes for element-wise division",
				shapeA: a.shape,
				shapeB: b.shape,
			});
		}

		const resultData: Node[] = [];
		for(let i = 0; i < a.data.size(); i++) {
			resultData.push(BasicNodes.Divide(a.data[i], b.data[i]));
		}

		return BasicNodes.Tensor(resultData, [...a.shape]);
	}

	static scalarMultiply(tensor: Tensor, scalar: Tensor): Tensor {
		const resultData: Node[] = [];
		for(let i = 0; i < tensor.data.size(); i++) {
			resultData.push(BasicNodes.Multiply(tensor.data[i], scalar));
		}

		return BasicNodes.Tensor(resultData, [...tensor.shape]);
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

		const resultData: Node[] = [];
		const resultShape = [rowsA, colsB];


		for(let i = 0; i < rowsA; i++) {
			for(let j = 0; j < colsB; j++) {
				const terms: Node[] = [];

				for(let k = 0; k < colsA; k++) {
					const aIndex = i * colsA + k;
					const bIndex = k * colsB + j;

					terms.push(BasicNodes.Multiply(a.data[aIndex], b.data[bIndex]));
				}

				if(terms.size() === 1) {
					resultData.push(terms[0]);
				} else {
					resultData.push(BasicNodes.Add(...terms));
				}
			}
		}

		return BasicNodes.Tensor(resultData, resultShape);
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

		const resultData: Node[] = [];
		for(let i = 0; i < a.data.size(); i++) {
			resultData.push(BasicNodes.Multiply(a.data[i], b.data[i]));
		}

		if(resultData.size() === 1) {
			return resultData[0];
		} else {
			return BasicNodes.Add(...resultData);
		}
	}

	static transpose(tensor: Tensor, axes?: number[]): Tensor {
		if(tensor.shape.size() === 0) {
			return BasicNodes.Tensor([...tensor.data], [...tensor.shape]);
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
		const newData: Node[] = [];
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

			newData.push(element);
		}

		return BasicNodes.Tensor(newData, newShape);
	}

	static identityMatrix(size: number): Tensor {
		const resultData: Node[] = [];
		const shape = [size, size];

		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				if(i === j) {
					resultData.push(BasicNodes.One());
				} else {
					resultData.push(BasicNodes.Zero());
				}
			}
		}

		return BasicNodes.Tensor(resultData, shape);
	}

	static zeros(shape: number[]): Tensor {
		const totalElements = this.shapeToTotalElements(shape);
		const resultData: Node[] = [];

		for(let i = 0; i < totalElements; i++) {
			resultData.push(BasicNodes.Zero());
		}

		return BasicNodes.Tensor(resultData, shape);
	}

	static ones(shape: number[]): Tensor {
		const totalElements = this.shapeToTotalElements(shape);
		const resultData: Node[] = [];

		for(let i = 0; i < totalElements; i++) {
			resultData.push(BasicNodes.One());
		}

		return BasicNodes.Tensor(resultData, shape);
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