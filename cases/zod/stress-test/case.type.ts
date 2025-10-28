import { z } from "zod";

const Big = z.object({
	n0: z.number().min(0),
	n1: z.number().min(0),
	n2: z.number().min(0),
	n3: z.number().min(0),
	n4: z.number().min(0),
	n5: z.number().min(0),
	n6: z.number().min(0),
	n7: z.number().min(0),
	n8: z.number().min(0),
	n9: z.number().min(0),
	n10: z.number().min(0),
	n11: z.number().min(0),
	n12: z.number().min(0),
	n13: z.number().min(0),
	n14: z.number().min(0),
	n15: z.number().min(0),
	n16: z.number().min(0),
	n17: z.number().min(0),
	n18: z.number().min(0),
	n19: z.number().min(0),
	n20: z.number().min(0),
	n21: z.number().min(0),
	n22: z.number().min(0),
	n23: z.number().min(0),
	n24: z.number().min(0),
	n25: z.number().min(0),
	n26: z.number().min(0),
	n27: z.number().min(0),
	n28: z.number().min(0),
	n29: z.number().min(0),
	s0: z.string(),
	s1: z.string(),
	s2: z.string(),
	s3: z.string(),
	s4: z.string(),
	s5: z.string(),
	s6: z.string(),
	s7: z.string(),
	s8: z.string(),
	s9: z.string(),
	s10: z.string(),
	s11: z.string(),
	s12: z.string(),
	s13: z.string(),
	s14: z.string(),
	s15: z.string(),
	s16: z.string(),
	s17: z.string(),
	s18: z.string(),
	s19: z.string(),
	s20: z.string(),
	s21: z.string(),
	s22: z.string(),
	s23: z.string(),
	s24: z.string(),
	s25: z.string(),
	s26: z.string(),
	s27: z.string(),
	s28: z.string(),
	s29: z.string(),
	u0: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u1: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u2: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u3: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u4: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u5: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u6: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u7: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u8: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u9: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u10: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u11: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u12: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u13: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u14: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u15: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u16: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u17: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u18: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	u19: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.tuple([z.string(), z.number()])),
	]),
	nested0: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested1: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested2: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested3: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested4: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested5: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
	nested6: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			flags: z.record(z.string(), z.boolean()),
		}),
	}),
	nested7: z.object({
		id: z.string(),
		data: z.array(
			z.object({
				a: z.string(),
				b: z.number(),
				c: z.enum(["x", "y", "z"]),
			}),
		),
		meta: z.object({
			tags: z.array(z.string()),
			count: z.number(),
		}),
	}),
});
type T = z.infer<typeof Big>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
