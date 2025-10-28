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

// Schema: array of objects + fixed-length tuple
const Item = object({
	id: string(),
	qty: pipe(number(), integer(), minValue(0)),
});
const Data = object({
	items: array(Item),
	pair: tuple([string(), number()]),
});

type DataT = InferOutput<typeof Data>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type DataReadonly = DeepReadonly<DataT>;
