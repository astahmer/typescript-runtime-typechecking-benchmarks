import { type } from "arktype";

const MapItem = type({ k: "string", v: "string | number" });

const VariantA = type({
	kind: "'a'",
	x: "number.integer >= 0",
	payload: [["string", "number"]],
	createdAt: "Date",
	tags: "('new'|'hot'|'sale'|'archived')[]",
	flags: { featured: "boolean", rating: "number" },
});

const VariantB = type({
	kind: "'b'",
	y: "string",
	extra: "(string|number|boolean)[]",
	createdAt: "Date",
	tags: "('new'|'hot'|'sale'|'archived')[]",
	flags: { featured: "boolean", rating: "number" },
});

const VariantC = type({
	kind: "'c'",
	zed: "boolean",
	map: MapItem.array(),
	createdAt: "Date",
	tags: "('new'|'hot'|'sale'|'archived')[]",
	flags: { featured: "boolean", rating: "number" },
});

const Union = VariantA.or(VariantB).or(VariantC);

type T = typeof Union.infer;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
