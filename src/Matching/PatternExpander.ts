import { Error, ErrorType } from "../Typescript/Error";
import { DetectionNode, MatchNode, Pattern } from "../Typescript/Match";
import { flatMap, slice } from "../Polyfill/Array";
import { NodeSerializer } from "../Node/NodeSerializer";

class ExpansionCache {
	private readonly cache = new Map<string, MatchNode[]>();
	private readonly maxSize;

	constructor(maxSize: number) {
		this.maxSize = maxSize;
	}

	private GetKey(pattern: Pattern): string {
		try {
			return NodeSerializer.PatternToString(pattern);
		} catch(err) {
			throw new Error(ErrorType.CacheError, {err});
		}
	}

	Get(pattern: Pattern): MatchNode[] | undefined {
		const key = this.GetKey(pattern);
		const value = this.cache.get(key);

		if(value !== undefined) {
			this.cache.delete(key);
			this.cache.set(key, value);
		}

		return value;
	}

	Set(pattern: Pattern, result: MatchNode[]): void {
		const key = this.GetKey(pattern);

		if(this.cache.has(key)) {
			this.cache.delete(key);
		} else if(this.cache.size() >= this.maxSize) {
			// noinspection LoopStatementThatDoesntLoopJS
			for(const [key, _] of this.cache) {
				this.cache.delete(key);
				break;
			}
		}

		this.cache.set(key, result);
	}

	Clear(): void {
		this.cache.clear();
	}

	getSize() {
		return this.cache.size();
	}
}

interface ExpansionConfig {
	readonly maxDepth: number;
	readonly enableCache: boolean;
	readonly maxCacheSize: number;
}

export class PatternExpander {
	readonly cache: ExpansionCache;
	private readonly config: ExpansionConfig;

	constructor(config?: Partial<ExpansionConfig>) {
		this.config = {
			maxDepth: 100,
			enableCache: true,
			maxCacheSize: 500,
			...config,
		};

		this.cache = new ExpansionCache(this.config.maxCacheSize);
	}

	Expand(pattern: Pattern) {
		if(this.config.enableCache) {
			const cached = this.cache.Get(pattern);
			if(cached) return cached;
		}

		const result = this.ExpandPattern(pattern, 0);

		if(this.config.enableCache) {
			this.cache.Set(pattern, result);
		}

		return result;
	}

	private ExpandPattern(pattern: Pattern, depth: number) {
		if(depth > this.config.maxDepth) {
			throw new Error(ErrorType.MaxDepthExceeded, {depth});
		}

		const result: MatchNode[] = [];

		for(const node of pattern) {
			const expanded = this.ExpandNode(node, depth + 1);
			for(const exp of expanded) {
				result.push(exp);
			}
		}

		return result;
	}

	private ExpandNode(node: DetectionNode, depth: number): MatchNode[] {
		if(!node.args) return [{...node, args: undefined}];

		switch(node.type) {
			default:
				return this.ExpandNormal(node, depth);
		}
	}

	private ExpandNormal(node: DetectionNode, depth: number) {
		if(!node.args) return [];

		const expandedArgs = node.args.map(arg => this.ExpandPattern(arg, depth));
		return this.GenerateCombinations(node, expandedArgs);
	}

	private GenerateCombinations(node: DetectionNode, expandedArgs: MatchNode[][]): MatchNode[] {
		const result: MatchNode[] = [];

		const combinations = this.CartesianProduct(expandedArgs);

		for(const combination of combinations) {
			if(node.commutative) {
				const permutations = this.GeneratePermutations(combination);
				permutations.forEach((permutation) => {
					result.push({
						...node,
						args: permutation,
					});
				});
			} else {
				result.push({
					...node,
					args: combination,
				});
			}
		}

		return result;
	}

	ClearCache(): void {
		this.cache.Clear();
	}

	SetConfig<K extends keyof ExpansionConfig>(config: K, value: ExpansionConfig[K]): void {
		this.config[config] = value;
	}

	private GeneratePermutations<T extends defined>(arr: T[]): T[][] {
		if(arr.size() === 0) return [[]];
		const result: T[][] = [];
		const used = new Set<T>();

		for(let i = 0; i < arr.size(); i++) {
			const current = arr[i];

			// Skip duplicates at current recursion level
			if(used.has(current)) continue;
			used.add(current);

			// Generate permutations of remaining elements
			const remaining = [...slice(arr, 0, i), ...slice(arr, i + 1)];
			const perms = this.GeneratePermutations(remaining);

			// Prepend current element to each permutation
			for(const perm of perms) {
				result.push([current, ...perm]);
			}
		}

		return result;
	}

	private CartesianProduct<T extends defined>(arrays: T[][]): T[][] {
		if(arrays.size() === 0) return [[]];

		const firstArray = arrays[0];
		const restArrays = slice(arrays, 1);
		const restProduct = this.CartesianProduct(restArrays);

		return flatMap(firstArray, item => restProduct.map(combination => [item, ...combination]));
	}
}