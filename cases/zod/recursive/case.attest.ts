import { bench } from "@ark/attest";
import { z } from "zod";

bench("zod/recursive typecheck", () => {
	type NodeT = { value: string; children: NodeT[] | undefined };
	const Node: z.ZodType<NodeT> = z.lazy(() =>
		z.object({
			value: z.string(),
			children: z.array(z.lazy(() => Node as z.ZodType<NodeT>)).optional(),
		}),
	);
	type T = z.infer<typeof Node>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type TR = DeepReadonly<T>;

	return {} as TR;
})
	.mean([5.14, "us"])
	.types([27032, "instantiations"]);
