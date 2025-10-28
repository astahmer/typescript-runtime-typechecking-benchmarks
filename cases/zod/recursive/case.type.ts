import { z } from "zod";

const Node = z.object({
	value: z.string(),
	get children() {
		return z.array(Node).optional();
	},
});
type T = z.infer<typeof Node>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
