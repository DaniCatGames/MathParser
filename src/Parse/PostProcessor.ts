import { Node, NodeType } from "../Typescript/Node";
import { PostProcessorFunctions } from "../Math/Symbolic/MathFunctions";
import { concat } from "../Polyfill/Array";
import { BasicNodes } from "../Node/BasicNodes";
import { PostProcNode, PostProcType } from "../Typescript/Parsing";
import { NodeUtils } from "../Node/NodeUtils";
import { ComplexUtils } from "../Math/Symbolic/Complex";

export function flat(node: Node): Node {
	if(node.type === NodeType.Add) {
		return {
			type: NodeType.Add,
			args: concatType(node.args, NodeType.Add),
		};
	} else if(node.type === NodeType.Multiply) {
		return {
			type: NodeType.Multiply,
			args: concatType(node.args, NodeType.Multiply),
		};
	} else if(NodeUtils.HasArgs(node)) {
		return {
			...node,
			args: node.args.map(arg => flat(arg)),
		};
	} else {
		return node;
	}
}

function concatType(args: Node[], nodeType: NodeType.Add | NodeType.Multiply): Node[] {
	let newArgs: Node[] = [];

	args.forEach(arg => {
		arg = flat(arg);

		if(arg.type === nodeType) newArgs = concat(newArgs, arg.args);
		else newArgs.push(arg);
	});

	return newArgs;
}

export function postProcess(node: PostProcNode): Node {
	switch(node.type) {
		case PostProcType.Function:
			for(const [_, fn] of ipairs(PostProcessorFunctions)) {
				if(fn.fn.names.includes(node.string)) return fn.converter(node.args.map(arg => postProcess(arg)));
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
		case PostProcType.Constant:
			return BasicNodes.Constant(node.string);
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
		const args = NodeUtils.GetArgs(node);
		if(args !== undefined && NodeUtils.HasArgs(node)) {
			return {
				...node,
				args: args.map(arg => complexLiterals(arg)),
			};
		} else {
			return node;
		}
	}
}