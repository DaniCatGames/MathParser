import { Complex } from "./Math";

export enum NodeType {
	// Numbers
	Literal = "Literal",
	Constant = "Constant",
	Variable = "Variable",

	// Operators
	Add = "Add",
	Multiply = "Multiply",
	Exponentiation = "Exponentiation",
	Equals = "Equals",
	Absolute = "Absolute",
	Factorial = "Factorial",

	Function = "Function",

	List = "List",
	Tensor = "Tensor",
}

export type Literal = {
	type: NodeType.Literal;
	number: Complex
}

export type Variable = {
	type: NodeType.Variable;
	string: string;
}

export type Constant = {
	type: NodeType.Constant;
	string: string;
}

export type Add = {
	type: NodeType.Add;
	args: Node[]
}

export type Multiply = {
	type: NodeType.Multiply;
	args: Node[]
}

export type Exponentiation = {
	type: NodeType.Exponentiation;
	args: Node[]
}

export type Absolute = {
	type: NodeType.Absolute;
	args: Node[]
}

export type Equals = {
	type: NodeType.Equals;
	args: Node[]
}

export type Function = {
	type: NodeType.Function;
	string: string;
	args: Node[]
}

export type Factorial = {
	type: NodeType.Factorial;
	args: Node[]
}

export type List = {
	type: NodeType.List;
	args: Node[]
}

export type Tensor = {
	type: NodeType.Tensor;
	shape: number[];
	args: Node[]
}

export type Node =
	Literal
	| Variable
	| Add
	| Multiply
	| Exponentiation
	| Absolute
	| Equals
	| Function
	| List
	| Factorial
	| Tensor
	| Constant

export interface ASTVisitor<T> {
	Visit(node: Node): T;

	VisitLiteral(node: Literal): T;

	VisitVariable(node: Variable): T;

	VisitAdd(node: Add): T;

	VisitMultiply(node: Multiply): T;

	VisitExponentiation(node: Exponentiation): T;

	VisitAbsolute(node: Absolute): T;

	VisitEquals(node: Equals): T;

	VisitFunction(node: Function): T;

	VisitList(node: List): T;

	VisitFactorial(node: Factorial): T;

	VisitTensor(node: Tensor): T;

	VisitConstant(node: Constant): T;
}

export interface Phase {
	name: string;
	visitor: ASTVisitor<Node>;
	enabled?: boolean;
	runBefore?: string[];
	runAfter?: string[];
}