export function concat<T extends defined>(...arrays: T[][]): T[] {
	const result: T[] = [];

	for(const array of arrays) {
		for(const item of array) {
			result.push(item);
		}
	}

	return result;
}

export function flatMap<T extends defined, U extends defined>(array: T[], callback: (element: T, index: number, array: T[]) => U[]): U[] {
	let result: U[] = [];

	for(let i = 0; i < array.size(); i++) {
		const mapped = callback(array[i], i, array);
		result = concat(result, mapped);
	}

	return result;
}

export function slice<T extends defined>(array: T[], startPos: number = 0, endPos?: number): T[] {
	const result: T[] = [];
	const arrayLength = array.size();

	if(startPos < 0) {
		startPos = math.max(0, arrayLength + startPos);
	} else {
		startPos = math.min(arrayLength, startPos);
	}

	if(endPos === undefined) {
		endPos = arrayLength;
	} else if(endPos < 0) {
		endPos = math.max(0, arrayLength + endPos);
	} else {
		endPos = math.min(arrayLength, endPos);
	}

	for(let i = startPos; i < endPos; i++) {
		result.push(array[i]);
	}

	return result;
}

export function map<T extends defined, U extends defined>(array: T[], callback: (element: T, index: number, array: T[]) => U): U[] {
	let result: U[] = [];

	for(let i = 0; i < array.size(); i++) {
		result.push(callback(array[i], i, array));
	}

	return result;
}

export function from<T extends defined>(size: number, value: T): T[] {
	const array: T[] = new Array(size);
	for(let i = 0; i < size; i++) {
		array[i] = value;
	}
	return array;
}

export function deDuplicate<T extends defined>(array: T[]): T[] {
	return array.reduce((acc, current) => {
		if(!acc.includes(current)) acc.push(current);
		return acc;
	}, new Array<T>());
}

export function arrayFromMap<T extends defined>(map: Map<defined, T>): T[] {
	const result: T[] = [];
	for(const [_, value] of map) {
		result.push(value);
	}
	return result;
}