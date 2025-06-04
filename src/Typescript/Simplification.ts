import { Pattern, SpecialNode, SpecialNodes } from "./Match";
import { Node } from "./Node";

export interface SimplificationRule {
	pattern: Pattern;
	requiredNodes: SpecialNode[];
	node?: (node: Node, nodes: SpecialNodes) => Node;
	children?: (node: Node, nodes: SpecialNodes) => Node;
}