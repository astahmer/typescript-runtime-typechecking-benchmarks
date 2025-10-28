import type { InferOutput } from "valibot";
import * as v from "valibot";

const Address = v.object({
	street: v.string(),
	city: v.string(),
	zip: v.string(),
	country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU"]),
});

const LineItem = v.object({
	sku: v.string(),
	qty: v.pipe(v.number(), v.integer(), v.minValue(1)),
	price: v.pipe(v.number(), v.minValue(0)),
});

const Payment = v.union([
	v.object({
		method: v.literal("card"),
		card: v.object({
			last4: v.string(),
			brand: v.picklist(["visa", "mc", "amex"]),
		}),
	}),
	v.object({
		method: v.literal("paypal"),
		email: v.pipe(v.string(), v.email()),
	}),
]);

const Order = v.object({
	id: v.string(),
	items: v.array(LineItem),
	payment: Payment,
	meta: v.object({
		notes: v.array(v.string()),
		coupons: v.array(v.string()),
	}),
});

const User = v.object({
	id: v.string(),
	profile: v.object({
		name: v.string(),
		contact: v.object({
			email: v.pipe(v.string(), v.email()),
			phones: v.array(v.string()),
		}),
	}),
	addresses: v.array(Address),
	orders: v.array(Order),
});

type T = InferOutput<typeof User>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
