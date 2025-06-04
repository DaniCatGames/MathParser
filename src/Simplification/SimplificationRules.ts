import { AdditionRules } from "./AdditionRules";
import { MultiplicationRules } from "./MultiplicationRules";

export const SimplificationRules = [
	...AdditionRules,
	...MultiplicationRules,
];