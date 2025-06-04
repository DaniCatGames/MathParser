type UnionToIntersection<U> =
	(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export const Object = {
	assign: <T extends { [K in keyof any]: unknown }, S extends { [K in keyof any]: unknown }[]>(
		target: T,
		...sources: S
	): T & UnionToIntersection<S[number]> => {
		for(const source of sources) {
			Object.entries(source).forEach(([key, value]) => {
				target[key as keyof T] = value as T[keyof T];
			});
		}

		return target as T & UnionToIntersection<S[number]>;
	},

	keys: <T extends object>(object: T): (keyof T)[] => {
		const keys: (keyof T)[] = [];

		for(const [key, _] of pairs(object)) {
			if(object[key as keyof T] === undefined) continue;
			keys.push(key as keyof T);
		}

		return keys;
	},

	values: <T extends object>(object: T): (T[keyof T])[] => {
		const keys = [];

		for(const [key, value] of pairs(object)) {
			if(object[key as keyof T] === undefined) continue;
			keys.push(value as T[keyof T]);
		}

		return keys;
	},

	entries: <T extends object>(object: T): { [K in keyof T]: [K, T[K]] }[keyof T][] => {
		return Object.keys(object).map(key => [key, object[key]]);
	},

	fromEntries: <
		K extends string,
		V,
		T extends [K, V][]>(...entries: T):

		{ [P in T[number][0]]: Extract<T[number], [P, any]>[1] } => {

		return entries.reduce((acc, [k, v]) => {
			acc[k] = v;
			return acc;
		}, {} as any);
	},

	toString: <T extends object>(object: T): string => {
		return game.GetService("HttpService").JSONEncode(object);
	},
};