import { bench } from "@ark/attest";
import { z } from "zod";

bench("zod/recursive typecheck", () => {
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

	return {} as TR;
})
	.mean([5.14, "us"])
	.types([27032, "instantiations"]);
