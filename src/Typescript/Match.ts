import {
	Absolute,
	Add,
	Equals,
	Exponentiation,
	Factorial,
	Function,
	List,
	Literal,
	Multiply,
	Node,
	NodeType,
	Tensor,
	Variable,
} from "./Node";
import { Complex } from "./Math";

type NodeByType<T extends NodeType> =
	T extends NodeType.Literal ? Literal :
		T extends NodeType.Variable ? Variable :
			T extends NodeType.Add ? Add :
				T extends NodeType.Multiply ? Multiply :
					T extends NodeType.Exponentiation ? Exponentiation :
						T extends NodeType.Absolute ? Absolute :
							T extends NodeType.Equals ? Equals :
								T extends NodeType.Function ? Function :
									T extends NodeType.List ? List :
										T extends NodeType.Factorial ? Factorial :
											T extends NodeType.Tensor ? Tensor :
												Node;

export interface DetectionNode<T extends NodeType = NodeType> {
	readonly type?: T;
	readonly string?: string;
	readonly number?: Complex;
	readonly args?: Pattern[];
	readonly conditions?: ((node: NodeByType<T>) => boolean)[];
	readonly specialNode?: string;
	readonly commutative?: boolean;
}

export type Pattern = readonly DetectionNode[];

export interface MatchNode {
	readonly type?: NodeType;
	readonly string?: string;
	readonly number?: Complex;
	readonly args?: MatchNode[];
	readonly conditions?: ((node: Node) => boolean)[];
	readonly specialNode?: string;
}

export type SpecialNodes = { [key: string]: Node }

export enum SpecialNode {
	P = "P",
	Q = "Q",
	R = "R",
	S = "S"
}