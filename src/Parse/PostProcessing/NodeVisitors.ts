import { Function, Node, Variable } from "../../Typescript/Node";
import { Nodes } from "../../Node/NodeUtils";
import { FunctionWithoutDerivative } from "../../Math/Symbolic/MathFunctions";
import { BaseASTVisitor } from "../../Node/Visitors";

export class FunctionVisitor extends BaseASTVisitor {
	constructor(private functionRegistry: { fn: FunctionWithoutDerivative, converter: (input: Node[]) => Node }[]) {
		super();
	}

	VisitFunction(node: Function): Node {
		for(const {fn, converter} of this.functionRegistry) {

			if(fn.names.includes(node.string)) {
				const args = node.args.map(arg => this.Visit(arg));
				return converter(args);
			}
		}

		return super.VisitFunction(node);
	}
}

export class ComplexVisitor extends BaseASTVisitor {
	constructor() {
		super();
	}

	VisitVariable(node: Variable): Node {
		if(node.string === "i") return Nodes.OneI();

		return super.VisitVariable(node);
	}
}