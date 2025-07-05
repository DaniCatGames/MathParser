import { Token, TokenType } from "../../Typescript/Parsing";
import { Registry } from "../../Registry";

export function RLEagerTokenizer(input: Token, registry: Registry) {
	const result: Token[] = [];

	while(input.value.size() !== 0) {
		const newToken = EagerTokenizer(input, registry);
		result.push(newToken);
		input = {
			type: input.type,
			index: input.index + newToken.value.size(),
			value: newToken.value.sub(1, -(newToken.value.size() + 1)),
		};
		if(input.value.size() !== 0) {
			result.push({
				type: TokenType.Multiply,
				value: "*",
				index: input.index,
			});
		}
	}

	return result;
}

function EagerTokenizer(input: Token, registry: Registry): Token {
	if(input.value.size() === 1) return input;
	if(isDefined(input.value, registry)) return input;

	const newToken: Token = {
		type: input.type,
		value: input.value.sub(2),
		index: input.index + 1,
	};
	return EagerTokenizer(newToken, registry);
}

function isDefined(input: string, registry: Registry): boolean {
	let defined = false;
	registry.functions.forEach(func => defined ||= func.names.includes(input));
	registry.postProcessorFunctions.forEach(func => defined ||= func.names.includes(input));
	for(const [name, _] of pairs(registry.variables)) defined ||= name === input;
	for(const [name, _] of pairs(registry.constants)) defined ||= name === input;
	return defined;
}