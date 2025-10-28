import type { InferOutput } from "valibot";
import * as v from "valibot";

type NodeT = {
	value: string;
	children?: NodeT[];
};

const Node = v.object({
	value: v.string(),
	children: v.optional(
		v.array(
			v.lazy((): v.GenericSchema<NodeT> => Node as v.GenericSchema<NodeT>),
		),
	),
});

type T = InferOutput<typeof Node>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
