import { Function } from "./Math/Symbolic/MathFunctions";
import { Node } from "./Typescript/Node";
import { Nodes } from "./Node/NodeUtils";

export class Registry {
	functions: Function[] = [];
	postProcessorFunctions: { names: string[], converter: (input: Node[]) => Node }[] = [];
	variables: { [key: string]: Node } = {a: Nodes.Zero()};
	constants: { [key: string]: Node } = {a: Nodes.One()};


	addVariables(...variables: ([string, Node] | string)[]) {
		variables.forEach((variable) => {
			if(typeIs(variable, "string")) {
				this.variables[variable] = Nodes.Zero();
			} else {
				this.variables[variable[0]] = variable[1];
			}
		});
	}

	addPostProcessorFunctions(...functions: { names: string[], converter: (input: Node[]) => Node }[]) {
		functions.forEach(func => this.postProcessorFunctions.push(func));
	}

	addFunctions(...functions: Function[]) {
		functions.forEach(func => this.functions.push(func));
	}

	addConstants(...constants: [string, Node][]) {
		constants.forEach((constant) => {
			this.constants[constant[0]] = constant[1];
		});
	}
}