import { Token, TokenType } from "../../Typescript/Parsing";

export function RLEagerTokenizer(input: Token, variables: Set<string>, functions: Set<string>) {
	const result: Token[] = [];

	while(input.value.size() !== 0) {
		const newToken = EagerTokenizer(input, variables, functions);
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

function EagerTokenizer(input: Token, variables: Set<string>, functions: Set<string>): Token {
	if(input.value.size() === 1) return input;
	if(isDefined(input.value, variables, functions)) return input;

	const newToken: Token = {
		type: input.type,
		value: input.value.sub(2),
		index: input.index + 1,
	};
	return EagerTokenizer(newToken, variables, functions);
}

function isDefined(input: string, variables: Set<string>, functions: Set<string>): boolean {
	return variables.has(input) || functions.has(input);
}