import type { InferOutput } from "valibot";
import * as v from "valibot";

// Schema
const User = v.object({
	id: v.string(),
	email: v.pipe(v.string(), v.email()),
	age: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(120)),
	roles: v.array(v.picklist(["user", "admin"])),
});

type UserT = InferOutput<typeof User>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type UserReadonly = DeepReadonly<UserT>;
