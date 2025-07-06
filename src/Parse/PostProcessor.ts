import { Node, Phase } from "../Typescript/Node";
import { Error, ErrorType } from "../Typescript/Error";
import { arrayFromMap } from "../Polyfill/Array";
import { FlatteningVisitor } from "../Node/Visitors";
import { Registry } from "../Registry";
import { ComplexVisitor, FunctionVisitor } from "./Visitors/Converting";
import { FunctionValidator, LeafValidator, OperatorValidator, TensorValidator } from "./Visitors/Validation";

export class PostProcessingPipeline {
	private phases: Map<string, Phase> = new Map();

	constructor(private registry: Registry) {
		this.setupDefaultPhases();
	}

	private setupDefaultPhases() {
		this.addPhase({
			name: "ComplexVariableConverter",
			visitor: new ComplexVisitor(),
		});

		this.addPhase({
			name: "FunctionConverter",
			visitor: new FunctionVisitor(this.registry),
			runAfter: ["ComplexVariableConverter"],
		});

		this.addPhase({
			name: "Flattening",
			visitor: new FlatteningVisitor(),
			runAfter: ["FunctionConverter"],
		});

		this.addPhase({
			name: "FunctionValidation",
			visitor: new FunctionValidator(this.registry),
			runAfter: ["Flattening"],
		});

		this.addPhase({
			name: "TensorValidation",
			visitor: new TensorValidator(),
			runAfter: ["Flattening"],
		});

		this.addPhase({
			name: "LeafValidation",
			visitor: new LeafValidator(this.registry),
			runAfter: ["Flattening"],
		});

		this.addPhase({
			name: "OperatorValidation",
			visitor: new OperatorValidator(),
			runAfter: ["Flattening"],
		});
	}

	addPhase(phase: Phase) {
		this.phases.set(phase.name, phase);
	}

	removePhase(name: string) {
		this.phases.delete(name);
	}

	enablePhase(name: string): void {
		const phase = this.phases.get(name);
		if(phase) {
			this.phases.set(phase.name, {
				...phase,
				enabled: true,
			});
		}
	}

	disablePhase(name: string): void {
		const phase = this.phases.get(name);
		if(phase) {
			this.phases.set(phase.name, {
				...phase,
				enabled: false,
			});
		}
	}

	process(node: Node): Node {
		const ordered = this.getExecutionOrder(arrayFromMap(this.phases));
		let current = node;

		for(const name of ordered) {
			const phase = this.phases.get(name)!;

			if(phase.enabled === false) continue;

			try {
				current = phase.visitor.Visit(current);
			} catch(error) {
				throw new Error(ErrorType.Parser, {
					message: `Error in phase '${phase.name}'`,
					originalError: error,
				});
			}
		}

		return current;
	}

	private getExecutionOrder(phases: Phase[]): string[] {
		const graph = new Map<string, string[]>();
		const inDegree = new Map<string, number>();

		for(const phase of phases) {
			graph.set(phase.name, []);
			inDegree.set(phase.name, 0);
		}

		for(const phase of phases) {
			if(phase.runAfter) {
				for(const dependency of phase.runAfter) {
					if(graph.has(dependency)) {
						const dep = graph.get(dependency) || [];
						dep.push(phase.name);
						graph.set(dependency, dep);
						inDegree.set(phase.name, (inDegree.get(phase.name) || 0) + 1);
					}
				}
			}

			if(phase.runBefore) {
				for(const dependent of phase.runBefore) {
					if(graph.has(dependent)) {
						const dep = graph.get(phase.name) || [];
						dep.push(phase.name);
						graph.set(phase.name, dep);
						inDegree.set(dependent, (inDegree.get(dependent) || 0) + 1);
					}
				}
			}
		}

		const queue: string[] = [];
		const result: string[] = [];

		for(const [name, degree] of pairs(inDegree)) {
			if(degree === 0) queue.push(name);
		}

		while(queue.size() > 0) {
			const current = queue.shift()!;
			result.push(current);

			for(const neighbor of graph.get(current)!) {
				inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
				if(inDegree.get(neighbor) === 0) {
					queue.push(neighbor);
				}
			}
		}

		if(result.size() !== phases.size()) {
			throw new Error(ErrorType.Parser, {
				message: "Circular dependency in phases",
			});
		}

		return result;
	}
}