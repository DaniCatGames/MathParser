import { AdditionRules } from "./AdditionRules";
import { MultiplicationRules } from "./MultiplicationRules";
import { ExponentiationRules } from "./ExponentiationRules";

export const SimplificationRules = [
	...AdditionRules,
	...MultiplicationRules,
	...ExponentiationRules,
];