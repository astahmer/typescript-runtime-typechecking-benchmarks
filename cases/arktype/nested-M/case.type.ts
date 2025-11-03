import { type } from "arktype";

const Address = type({
	street: "string",
	city: "string",
	zip: "string",
	country: type.enumerated("US", "CA", "GB", "FR", "DE", "AU"),
});

const LineItem = type({
	sku: "string",
	qty: "number.integer >= 1",
	price: "number >= 0",
});

const CardBrand = type.enumerated("visa", "mc", "amex");

const PaymentCard = type({
	method: type.enumerated("card"),
	card: { last4: "string", brand: CardBrand },
});
const PaymentPayPal = type({
	method: type.enumerated("paypal"),
	email: "string.email",
});
const Payment = PaymentCard.or(PaymentPayPal);

const Order = type({
	id: "string",
	items: LineItem.array(),
	payment: Payment,
	meta: { notes: "string[]", coupons: "string[]" },
});

const User = type({
	id: "string",
	profile: {
		name: "string",
		contact: { email: "string.email", phones: "string[]" },
	},
	addresses: Address.array(),
	orders: Order.array(),
});

type T = typeof User.infer;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
