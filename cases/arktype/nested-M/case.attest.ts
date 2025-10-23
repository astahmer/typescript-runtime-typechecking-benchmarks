import { type } from "arktype";
import { bench } from "@ark/attest";

bench("arktype/nested-M typecheck", () => {
  const Address = type({
    street: "string",
    city: "string",
    zip: "string",
    country: "'US'|'CA'|'GB'|'FR'|'DE'|'AU'",
  });

  const LineItem = type({
    sku: "string",
    qty: "number.integer >= 1",
    price: "number >= 0",
  });

  const PaymentCard = type({
    method: "'card'",
    card: { last4: "string", brand: "'visa'|'mc'|'amex'" },
  });
  const PaymentPayPal = type({ method: "'paypal'", email: "string.email" });
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

  return {} as TR;
})
  .mean([439.12, "us"])
  .types([24084, "instantiations"]);
