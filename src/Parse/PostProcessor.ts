import { Node, NodeType } from "../Typescript/Node";
import { PostProcessorFunctions } from "../Math/Symbolic/MathFunctions";
import { flatMap } from "../Polyfill/Array";
import { BasicNodes } from "../Node/BasicNodes";
import { PostProcNode, PostProcType } from "../Typescript/Parsing";
import { NodeUtils } from "../Node/NodeUtils";
import { Error, ErrorType } from "../Typescript/Error";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export function flattenAST(node: Node): Node {
	function flattenNode(node: Node, parentType?: NodeType): Node[] {
		if(node.type === parentType && (node.type === NodeType.Add || node.type === NodeType.Multiply)) {
			return flatMap(node.args, (arg) => flattenNode(arg, node.type));
		} else if(node.type === NodeType.Variable || node.type === NodeType.Constant || node.type === NodeType.Literal) {
			return [node];
		} else {
			const args = NodeUtils.getArgs(node);
			if(!args) throw new Error(ErrorType.Parser, {
				message: "node does not have arguments",
			});
			const newArgs = flatMap(args, (arg) => flattenNode(arg, node.type));

			return [{
				...node,
				args: newArgs,
			}];
		}
	}

	return flattenNode(node)[0];
}

export function postProcess(node: PostProcNode): Node {
	switch(node.type) {
		case PostProcType.Function:
			for(const [name, func] of pairs(PostProcessorFunctions)) {
				if(node.string === name) return func(node.args.map(arg => postProcess(arg)));
			}
			return BasicNodes.Function(node.string, ...node.args.map(arg => postProcess(arg)));
		case PostProcType.Unary:
			return BasicNodes.Negative(postProcess(node.args[0]));
		case PostProcType.Add:
			return BasicNodes.Add(postProcess(node.args[0]), postProcess(node.args[1]));
		case PostProcType.Subtract:
			return BasicNodes.Subtract(postProcess(node.args[0]), postProcess(node.args[1]));
		case PostProcType.Divide:
			return BasicNodes.Divide(postProcess(node.args[0]), postProcess(node.args[1]));
		case PostProcType.Multiply:
			return BasicNodes.Multiply(postProcess(node.args[0]), postProcess(node.args[1]));
		case PostProcType.Exponentiation:
			return BasicNodes.Exponentiation(postProcess(node.args[0]), postProcess(node.args[1]));
		case PostProcType.Factorial:
			return BasicNodes.Factorial(postProcess(node.args[0]));
		case PostProcType.List:
			return BasicNodes.List(...node.args.map(preProcNode => postProcess(preProcNode)));
		case PostProcType.Literal:
			return BasicNodes.Literal(node.number);
		case PostProcType.Variable:
			return BasicNodes.Variable(node.string);
		case PostProcType.Absolute:
			return BasicNodes.Absolute(postProcess(node.args[0]));
		case PostProcType.Tensor:
			return BasicNodes.Tensor(node.args.map(arg => postProcess(arg)), node.shape);
	}
}

export function complexLiterals(node: Node): Node {
	if(node.type === NodeType.Variable && node.string === "i") {
		return BasicNodes.Literal(ComplexUtils.fromNumbers(0, 1, 1, 1));
	} else {
		const args = NodeUtils.getArgs(node);
		if(args !== undefined && NodeUtils.hasArgs(node)) {
			return {
				...node,
				args: args.map(arg => complexLiterals(arg)),
			};
		} else {
			return node;
		}
	}
}