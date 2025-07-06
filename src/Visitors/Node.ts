import { Add, Multiply, Node } from "../Typescript/Node";
import { Nodes, NodeTests } from "../Node/NodeUtils";
import { NodeVisitor } from "./Base";

export class FlatteningVisitor extends NodeVisitor {
	constructor() {
		super();
	}

	VisitAdd(node: Add): Node {
		const nodes: Node[] = [];

		node.args.forEach(arg => {
			arg = this.Visit(arg);

			if(NodeTests.Add(arg)) {
				arg.args.forEach(arg => nodes.push(arg));
			} else {
				nodes.push(arg);
			}
		});

		return Nodes.Add(...nodes);
	}

	VisitMultiply(node: Multiply): Node {
		const nodes: Node[] = [];

		node.args.forEach(arg => {
			arg = this.Visit(arg);

			if(NodeTests.Add(arg)) {
				arg.args.forEach(arg => nodes.push(arg));
			} else {
				nodes.push(arg);
			}
		});

		return Nodes.Multiply(...nodes);
	}
}