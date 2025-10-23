import { bench } from "@ark/attest";
import * as S from "@effect/schema/Schema";

bench("effect/nested-M typecheck", () => {
  const Address = S.Struct({
    street: S.String,
    city: S.String,
    zip: S.String,
    country: S.Literal("US", "CA", "GB", "FR", "DE", "AU"),
  });

  const LineItem = S.Struct({
    sku: S.String,
    qty: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
    price: S.Number.pipe(S.greaterThanOrEqualTo(0)),
  });

  const Payment = S.Union(
    S.Struct({
      method: S.Literal("card"),
      card: S.Struct({
        last4: S.String,
        brand: S.Literal("visa", "mc", "amex"),
      }),
    }),
    S.Struct({
      method: S.Literal("paypal"),
      email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
    }),
  );

  const Order = S.Struct({
    id: S.String,
    items: S.Array(LineItem),
    payment: Payment,
    meta: S.Struct({
      notes: S.Array(S.String),
      coupons: S.Array(S.String),
    }),
  });

  const User = S.Struct({
    id: S.String,
    profile: S.Struct({
      name: S.String,
      contact: S.Struct({
        email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
        phones: S.Array(S.String),
      }),
    }),
    addresses: S.Array(Address),
    orders: S.Array(Order),
  });

  type T = S.Schema.Type<typeof User>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([151.8, "us"])
  .types([11569, "instantiations"]);
