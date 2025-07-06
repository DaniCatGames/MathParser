import { BaseASTVisitor } from "../../Node/Visitors";
import { Function, Node, Variable } from "../../Typescript/Node";
import { Nodes } from "../../Node/NodeUtils";
import { Registry } from "../../Registry";

export class FunctionVisitor extends BaseASTVisitor {
	constructor(private registry: Registry) {
		super();
	}

	VisitFunction(node: Function): Node {
		for(const {names, converter} of this.registry.postProcessorFunctions) {
			if(names.includes(node.string)) {
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