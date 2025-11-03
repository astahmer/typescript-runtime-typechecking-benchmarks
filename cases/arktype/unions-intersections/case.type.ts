import { type } from "arktype";

const MapItem = type({ k: "string", v: "string | number" });

const Tags = type.enumerated("new", "hot", "sale", "archived");
const Flags = type({
	featured: "boolean",
	rating: "number",
});

const VariantA = type({
	kind: type.enumerated("a"),
	x: "number.integer >= 0",
	payload: type(["string", "number"]).array(),
	createdAt: "Date",
	tags: Tags.array(),
	flags: Flags,
});

const VariantB = type({
	kind: type.enumerated("b"),
	y: "string",
	extra: type("string | number | boolean").array(),
	createdAt: "Date",
	tags: Tags.array(),
	flags: Flags,
});

const VariantC = type({
	kind: type.enumerated("c"),
	zed: "boolean",
	map: MapItem.array(),
	createdAt: "Date",
	tags: Tags.array(),
	flags: Flags,
});

const Union = VariantA.or(VariantB).or(VariantC);

type T = typeof Union.infer;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
