import { bench } from "@ark/attest";
import {
	array,
	type InferOutput,
	integer,
	minValue,
	number,
	object,
	pipe,
	string,
	tuple,
} from "valibot";

bench("valibot/arrays-tuples typecheck", () => {
	// Schema: array of objects + fixed-length tuple
	const Item = object({
		id: string(),
		qty: pipe(number(), integer(), minValue(0)),
	});
	const Data = object({
		items: array(Item),
		pair: tuple([string(), number()]),
	});

	// Inferred type
	type DataT = InferOutput<typeof Data>;

	// Synthetic usage to force evaluation
	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type DataReadonly = DeepReadonly<DataT>;

	return {} as DataReadonly;
})
	.mean([3.51, "us"])
	.types([7731, "instantiations"]);
