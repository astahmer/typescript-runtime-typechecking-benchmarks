import { bench } from "@ark/attest";
import * as S from "effect/Schema";

bench("effect/simple-object-S typecheck", () => {
	// Schema
	const User = S.Struct({
		id: S.String,
		email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
		age: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(0),
			S.lessThanOrEqualTo(120),
		),
		roles: S.Array(S.Literal("user", "admin")),
	});

	// Inferred type
	type UserT = S.Schema.Type<typeof User>;

	// Synthetic usage to force evaluation
	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type UserReadonly = DeepReadonly<UserT>;

	return {} as UserReadonly;
})
	.mean([38.37, "us"])
	.types([5464, "instantiations"]);
