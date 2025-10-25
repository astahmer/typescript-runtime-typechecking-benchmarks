import { bench } from "@ark/attest";
import { type } from "arktype";

bench("arktype/stress-test typecheck", () => {
	const DataItem = type({
		a: "string",
		b: "number",
		c: "'x'|'y'|'z'",
	});

	const UnionType = type("string")
		.or("number")
		.or("boolean")
		.or([["string", "number"]]);

	const Big = type({
		n0: "number >= 0",
		n1: "number >= 0",
		n2: "number >= 0",
		n3: "number >= 0",
		n4: "number >= 0",
		n5: "number >= 0",
		n6: "number >= 0",
		n7: "number >= 0",
		n8: "number >= 0",
		n9: "number >= 0",
		n10: "number >= 0",
		n11: "number >= 0",
		n12: "number >= 0",
		n13: "number >= 0",
		n14: "number >= 0",
		n15: "number >= 0",
		n16: "number >= 0",
		n17: "number >= 0",
		n18: "number >= 0",
		n19: "number >= 0",
		n20: "number >= 0",
		n21: "number >= 0",
		n22: "number >= 0",
		n23: "number >= 0",
		n24: "number >= 0",
		n25: "number >= 0",
		n26: "number >= 0",
		n27: "number >= 0",
		n28: "number >= 0",
		n29: "number >= 0",
		s0: "string",
		s1: "string",
		s2: "string",
		s3: "string",
		s4: "string",
		s5: "string",
		s6: "string",
		s7: "string",
		s8: "string",
		s9: "string",
		s10: "string",
		s11: "string",
		s12: "string",
		s13: "string",
		s14: "string",
		s15: "string",
		s16: "string",
		s17: "string",
		s18: "string",
		s19: "string",
		s20: "string",
		s21: "string",
		s22: "string",
		s23: "string",
		s24: "string",
		s25: "string",
		s26: "string",
		s27: "string",
		s28: "string",
		s29: "string",
		u0: UnionType,
		u1: UnionType,
		u2: UnionType,
		u3: UnionType,
		u4: UnionType,
		u5: UnionType,
		u6: UnionType,
		u7: UnionType,
		u8: UnionType,
		u9: UnionType,
		u10: UnionType,
		u11: UnionType,
		u12: UnionType,
		u13: UnionType,
		u14: UnionType,
		u15: UnionType,
		u16: UnionType,
		u17: UnionType,
		u18: UnionType,
		u19: UnionType,
		nested0: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested1: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested2: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested3: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested4: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested5: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested6: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
		nested7: {
			id: "string",
			data: DataItem.array(),
			meta: { tags: "string[]", count: "number" },
		},
	});

	type T = typeof Big.infer;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type TR = DeepReadonly<T>;

	return {} as TR;
})
	.mean([1.12, "ms"])
	.types([45887, "instantiations"]);
