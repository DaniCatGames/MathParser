import { Function } from "./Math/Symbolic/MathFunctions";
import { Node } from "./Typescript/Node";
import { Nodes } from "./Node/NodeUtils";

export class Registry {
	functions: Function[] = [];
	postProcessorFunctions: { names: string[], converter: (input: Node[]) => Node }[] = [];
	variables: { [key: string]: Node } = {};
	constants: { [key: string]: Node } = {};


	AddVariables(...variables: ([string, Node] | string)[]) {
		variables.forEach((variable) => {
			if(typeIs(variable, "string")) {
				this.variables[variable] = Nodes.Zero();
			} else {
				this.variables[variable[0]] = variable[1];
			}
		});
	}

	AddPostProcessorFunctions(...functions: { names: string[], converter: (input: Node[]) => Node }[]) {
		functions.forEach(func => this.postProcessorFunctions.push(func));
	}

	AddFunctions(...functions: Function[]) {
		functions.forEach(func => this.functions.push(func));
	}

	AddConstants(...constants: [string, Node][]) {
		constants.forEach((constant) => {
			this.constants[constant[0]] = constant[1];
		});
	}
}