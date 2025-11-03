import { type } from "arktype";

// Schema
const Role = type.enumerated("user", "admin");

const User = type({
	id: "string",
	email: "string.email",
	age: "0 <= number.integer <= 120",
	roles: Role.array(),
});

// Inferred type
// arktype's .infer is the static type
type UserT = typeof User.infer;

// Synthetic usage to force evaluation
type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type UserReadonly = DeepReadonly<UserT>;
