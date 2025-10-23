import { z } from "zod";
import { bench } from "@ark/attest";

bench("zod/nested-M typecheck", () => {
  const Address = z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.enum(["US", "CA", "GB", "FR", "DE", "AU"]),
  });

  const LineItem = z.object({
    sku: z.string(),
    qty: z.number().int().min(1),
    price: z.number().min(0),
  });

  const Payment = z.union([
    z.object({
      method: z.literal("card"),
      card: z.object({
        last4: z.string(),
        brand: z.enum(["visa", "mc", "amex"]),
      }),
    }),
    z.object({ method: z.literal("paypal"), email: z.string().email() }),
  ]);

  const Order = z.object({
    id: z.string(),
    items: z.array(LineItem),
    payment: Payment,
    meta: z.object({
      notes: z.array(z.string()),
      coupons: z.array(z.string()),
    }),
  });

  const User = z.object({
    id: z.string(),
    profile: z.object({
      name: z.string(),
      contact: z.object({
        email: z.string().email(),
        phones: z.array(z.string()),
      }),
    }),
    addresses: z.array(Address),
    orders: z.array(Order),
  });

  type T = z.infer<typeof User>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([302.34, "us"])
  .types([1403, "instantiations"]);
