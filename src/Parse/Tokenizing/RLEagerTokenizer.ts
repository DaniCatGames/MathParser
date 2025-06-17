import { Token, TokenType } from "../../Typescript/Parsing";

export function RLEagerTokenizer(input: Token, identifiers: Set<string>) {
	const result: Token[] = [];

	while(input.value.size() !== 0) {
		const newToken = EagerTokenizer(input, identifiers);
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

function EagerTokenizer(input: Token, identifiers: Set<string>): Token {
	if(input.value.size() === 1) return input;
	if(isDefined(input.value, identifiers)) return input;

	const newToken: Token = {
		type: input.type,
		value: input.value.sub(2),
		index: input.index + 1,
	};
	return EagerTokenizer(newToken, identifiers);
}

function isDefined(input: string, identifiers: Set<string>): boolean {
	return identifiers.has(input);
}