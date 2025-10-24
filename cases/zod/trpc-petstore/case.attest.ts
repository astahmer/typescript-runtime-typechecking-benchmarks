import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { bench } from "@ark/attest";

bench("zod/trpc-petstore typecheck", () => {
  const t = initTRPC.create();

  // Common schemas
  const Id = z.string().uuid();
  const Timestamp = z.string().datetime();
  const Email = z.string().email();
  const Url = z.string().url();

  const PaginationInput = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["name", "createdAt", "price"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  });

  const PaginationMeta = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  });

  // Pet schemas
  const PetStatus = z.enum(["available", "pending", "sold"]);

  const Category = z.object({
    id: Id,
    name: z.string(),
    description: z.string().optional(),
    imageUrl: Url.optional(),
  });

  const Tag = z.object({
    id: Id,
    name: z.string(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  });

  const Vaccination = z.object({
    id: Id,
    name: z.string(),
    date: z.string().date(),
    expiresAt: z.string().date().optional(),
    veterinarian: z.string(),
  });

  const Pet = z.object({
    id: Id,
    name: z.string().min(1).max(100),
    category: Category,
    photoUrls: z.array(Url),
    tags: z.array(Tag),
    status: PetStatus,
    price: z.number().min(0),
    weight: z.number().min(0.1).optional(),
    age: z.number().int().min(0).optional(),
    birthDate: z.string().date().optional(),
    breed: z.string().optional(),
    description: z.string().max(1000).optional(),
    vaccinations: z.array(Vaccination).optional(),
    microchipId: z.string().optional(),
    createdAt: Timestamp,
    updatedAt: Timestamp,
  });

  const CreatePetInput = z.object({
    name: z.string().min(1).max(100),
    categoryId: Id,
    photoUrls: z.array(Url),
    tagIds: z.array(Id),
    status: PetStatus.default("available"),
    price: z.number().min(0),
    weight: z.number().min(0.1).optional(),
    birthDate: z.string().date().optional(),
    breed: z.string().optional(),
    description: z.string().max(1000).optional(),
  });

  const UpdatePetInput = z.object({
    id: Id,
    name: z.string().min(1).max(100).optional(),
    categoryId: Id.optional(),
    photoUrls: z.array(Url).optional(),
    tagIds: z.array(Id).optional(),
    status: PetStatus.optional(),
    price: z.number().min(0).optional(),
    weight: z.number().min(0.1).optional(),
    description: z.string().max(1000).optional(),
  });

  // Order schemas
  const OrderStatus = z.enum([
    "placed",
    "approved",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]);
  const PaymentStatus = z.enum(["pending", "completed", "failed", "refunded"]);

  const ShippingAddress = z.object({
    street: z.string(),
    unit: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.enum(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
    phone: z.string().regex(/^\+?[\d\s-()]+$/),
  });

  const PaymentMethod = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("credit_card"),
      last4: z.string().length(4),
      brand: z.enum(["visa", "mastercard", "amex", "discover"]),
      expiryMonth: z.number().int().min(1).max(12),
      expiryYear: z.number().int().min(2024),
    }),
    z.object({
      type: z.literal("paypal"),
      email: Email,
      transactionId: z.string().optional(),
    }),
    z.object({
      type: z.literal("bank_transfer"),
      accountNumber: z.string(),
      routingNumber: z.string(),
      bankName: z.string(),
    }),
    z.object({
      type: z.literal("crypto"),
      currency: z.enum(["BTC", "ETH", "USDC"]),
      walletAddress: z.string(),
      transactionHash: z.string().optional(),
    }),
  ]);

  const OrderItem = z.object({
    petId: Id,
    pet: Pet,
    quantity: z.number().int().min(1),
    priceAtTime: z.number().min(0),
  });

  const Order = z.object({
    id: Id,
    orderNumber: z.string(),
    customerId: Id,
    items: z.array(OrderItem),
    status: OrderStatus,
    paymentStatus: PaymentStatus,
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress.optional(),
    paymentMethod: PaymentMethod,
    subtotal: z.number().min(0),
    tax: z.number().min(0),
    shipping: z.number().min(0),
    discount: z.number().min(0).default(0),
    total: z.number().min(0),
    notes: z.string().max(500).optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: Timestamp.optional(),
    createdAt: Timestamp,
    updatedAt: Timestamp,
    paidAt: Timestamp.optional(),
    shippedAt: Timestamp.optional(),
    deliveredAt: Timestamp.optional(),
    cancelledAt: Timestamp.optional(),
    cancellationReason: z.string().optional(),
  });

  const CreateOrderInput = z.object({
    items: z.array(
      z.object({
        petId: Id,
        quantity: z.number().int().min(1),
      }),
    ),
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress.optional(),
    paymentMethod: PaymentMethod,
    notes: z.string().max(500).optional(),
  });

  // Customer schemas
  const Customer = z.object({
    id: Id,
    email: Email,
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z
      .string()
      .regex(/^\+?[\d\s-()]+$/)
      .optional(),
    dateOfBirth: z.string().date().optional(),
    addresses: z.array(
      z.object({
        id: Id,
        type: z.enum(["home", "work", "other"]),
        ...ShippingAddress.shape,
        isDefault: z.boolean(),
      }),
    ),
    preferences: z.object({
      newsletter: z.boolean(),
      smsNotifications: z.boolean(),
      emailNotifications: z.boolean(),
      favoriteCategories: z.array(Id),
      preferredPaymentMethod: z
        .enum(["credit_card", "paypal", "bank_transfer", "crypto"])
        .optional(),
    }),
    loyaltyPoints: z.number().int().min(0),
    membershipTier: z.enum(["bronze", "silver", "gold", "platinum"]),
    createdAt: Timestamp,
    updatedAt: Timestamp,
    lastLoginAt: Timestamp.optional(),
    emailVerified: z.boolean(),
  });

  const RegisterInput = z.object({
    email: Email,
    password: z.string().min(8).max(100),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z
      .string()
      .regex(/^\+?[\d\s-()]+$/)
      .optional(),
    dateOfBirth: z.string().date().optional(),
  });

  const UpdateProfileInput = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s-()]+$/)
      .optional(),
    dateOfBirth: z.string().date().optional(),
    preferences: z
      .object({
        newsletter: z.boolean(),
        smsNotifications: z.boolean(),
        emailNotifications: z.boolean(),
        favoriteCategories: z.array(Id),
        preferredPaymentMethod: z
          .enum(["credit_card", "paypal", "bank_transfer", "crypto"])
          .optional(),
      })
      .optional(),
  });

  // Review schemas
  const ReviewImage = z.object({
    id: Id,
    url: Url,
    caption: z.string().max(200).optional(),
  });

  const Review = z.object({
    id: Id,
    petId: Id,
    customerId: Id,
    customer: z.object({
      id: Id,
      firstName: z.string(),
      lastName: z.string(),
      membershipTier: z.enum(["bronze", "silver", "gold", "platinum"]),
    }),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(200),
    comment: z.string().min(1).max(2000),
    images: z.array(ReviewImage).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    wouldRecommend: z.boolean(),
    helpful: z.number().int().min(0),
    notHelpful: z.number().int().min(0),
    verified: z.boolean(),
    response: z
      .object({
        text: z.string(),
        respondedAt: Timestamp,
        respondedBy: z.string(),
      })
      .optional(),
    createdAt: Timestamp,
    updatedAt: Timestamp,
  });

  const CreateReviewInput = z.object({
    petId: Id,
    orderId: Id,
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(200),
    comment: z.string().min(1).max(2000),
    images: z.array(Url).optional(),
    pros: z.array(z.string().max(100)).optional(),
    cons: z.array(z.string().max(100)).optional(),
    wouldRecommend: z.boolean(),
  });

  // Inventory schemas
  const Warehouse = z.object({
    id: Id,
    name: z.string(),
    code: z.string(),
    location: z.object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      coordinates: z
        .object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
        })
        .optional(),
    }),
    capacity: z.number().int().min(0),
    isActive: z.boolean(),
  });

  const InventoryItem = z.object({
    petId: Id,
    pet: Pet,
    quantityAvailable: z.number().int().min(0),
    quantityReserved: z.number().int().min(0),
    quantityInTransit: z.number().int().min(0),
    reorderLevel: z.number().int().min(0),
    reorderQuantity: z.number().int().min(0),
    warehouse: Warehouse,
    location: z
      .object({
        aisle: z.string(),
        shelf: z.string(),
        bin: z.string(),
      })
      .optional(),
    lastRestocked: Timestamp.optional(),
    nextRestockDate: Timestamp.optional(),
    supplier: z
      .object({
        id: Id,
        name: z.string(),
        contact: Email,
      })
      .optional(),
  });

  // Analytics schemas
  const SalesMetrics = z.object({
    totalRevenue: z.number().min(0),
    totalOrders: z.number().int().min(0),
    averageOrderValue: z.number().min(0),
    conversionRate: z.number().min(0).max(100),
    topSellingPets: z.array(
      z.object({
        petId: Id,
        name: z.string(),
        category: z.string(),
        unitsSold: z.number().int().min(0),
        revenue: z.number().min(0),
      }),
    ),
    revenueByCategory: z.array(
      z.object({
        categoryId: Id,
        categoryName: z.string(),
        revenue: z.number().min(0),
        orders: z.number().int().min(0),
      }),
    ),
  });

  const CustomerMetrics = z.object({
    newCustomers: z.number().int().min(0),
    returningCustomers: z.number().int().min(0),
    churnRate: z.number().min(0).max(100),
    customerLifetimeValue: z.number().min(0),
    averageOrdersPerCustomer: z.number().min(0),
  });

  const InventoryMetrics = z.object({
    lowStockItems: z.number().int().min(0),
    outOfStockItems: z.number().int().min(0),
    totalValue: z.number().min(0),
    turnoverRate: z.number().min(0),
  });

  const AnalyticsReport = z.object({
    period: z.object({
      start: Timestamp,
      end: Timestamp,
      type: z.enum(["day", "week", "month", "quarter", "year"]),
    }),
    sales: SalesMetrics,
    customers: CustomerMetrics,
    inventory: InventoryMetrics,
    trends: z.array(
      z.object({
        date: Timestamp,
        revenue: z.number(),
        orders: z.number().int(),
        newCustomers: z.number().int(),
      }),
    ),
  });

  // Mock data factories
  const mockId = "123e4567-e89b-12d3-a456-426614174000";
  const mockTimestamp = "2024-01-01T00:00:00.000Z";
  const mockEmail = "test@example.com";
  const mockUrl = "https://example.com/image.jpg";

  const mockCategory = {
    id: mockId,
    name: "Dogs",
    description: "All dogs",
    imageUrl: mockUrl,
  };
  const mockTag = { id: mockId, name: "Friendly", color: "#FF5733" };
  const mockVaccination = {
    id: mockId,
    name: "Rabies",
    date: "2024-01-01",
    expiresAt: "2025-01-01",
    veterinarian: "Dr. Smith",
  };

  const mockPet = {
    id: mockId,
    name: "Buddy",
    category: mockCategory,
    photoUrls: [mockUrl],
    tags: [mockTag],
    status: "available" as const,
    price: 500,
    weight: 25.5,
    age: 2,
    birthDate: "2022-01-01",
    breed: "Golden Retriever",
    description: "A friendly dog",
    vaccinations: [mockVaccination],
    microchipId: "123456789",
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  const mockPagination = { page: 1, limit: 20, total: 100, totalPages: 5 };

  const mockShippingAddress = {
    street: "123 Main St",
    unit: "Apt 4",
    city: "Boston",
    state: "MA",
    zipCode: "02101",
    country: "US" as const,
    phone: "+1-555-0123",
  };

  const mockOrderItem = {
    petId: mockId,
    pet: mockPet,
    quantity: 1,
    priceAtTime: 500,
  };

  const mockOrder = {
    id: mockId,
    orderNumber: "ORD-12345",
    customerId: mockId,
    items: [mockOrderItem],
    status: "placed" as const,
    paymentStatus: "pending" as const,
    shippingAddress: mockShippingAddress,
    billingAddress: mockShippingAddress,
    paymentMethod: {
      type: "credit_card" as const,
      last4: "1234",
      brand: "visa" as const,
      expiryMonth: 12,
      expiryYear: 2025,
    },
    subtotal: 500,
    tax: 50,
    shipping: 10,
    discount: 0,
    total: 560,
    notes: "Please deliver carefully",
    trackingNumber: "TRACK123",
    estimatedDelivery: mockTimestamp,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    paidAt: mockTimestamp,
    shippedAt: mockTimestamp,
    deliveredAt: mockTimestamp,
    cancelledAt: undefined,
    cancellationReason: undefined,
  };

  const mockCustomer = {
    id: mockId,
    email: mockEmail,
    firstName: "John",
    lastName: "Doe",
    phone: "+1-555-0123",
    dateOfBirth: "1990-01-01",
    addresses: [
      {
        id: mockId,
        type: "home" as const,
        ...mockShippingAddress,
        isDefault: true,
      },
    ],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true,
      favoriteCategories: [mockId],
      preferredPaymentMethod: "credit_card" as const,
    },
    loyaltyPoints: 1000,
    membershipTier: "gold" as const,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    lastLoginAt: mockTimestamp,
    emailVerified: true,
  };

  const mockReview = {
    id: mockId,
    petId: mockId,
    customerId: mockId,
    customer: {
      id: mockId,
      firstName: "John",
      lastName: "Doe",
      membershipTier: "gold" as const,
    },
    rating: 5,
    title: "Great pet!",
    comment: "Very happy with this purchase",
    images: [{ id: mockId, url: mockUrl, caption: "Happy pet" }],
    pros: ["Friendly", "Healthy"],
    cons: [],
    wouldRecommend: true,
    helpful: 10,
    notHelpful: 1,
    verified: true,
    response: {
      text: "Thank you!",
      respondedAt: mockTimestamp,
      respondedBy: "Store Owner",
    },
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  const mockWarehouse = {
    id: mockId,
    name: "Main Warehouse",
    code: "WH001",
    location: {
      address: "456 Storage Ave",
      city: "Boston",
      state: "MA",
      country: "US",
      coordinates: { lat: 42.3601, lng: -71.0589 },
    },
    capacity: 10000,
    isActive: true,
  };

  const mockInventoryItem = {
    petId: mockId,
    pet: mockPet,
    quantityAvailable: 50,
    quantityReserved: 5,
    quantityInTransit: 10,
    reorderLevel: 20,
    reorderQuantity: 50,
    warehouse: mockWarehouse,
    location: { aisle: "A1", shelf: "S2", bin: "B3" },
    lastRestocked: mockTimestamp,
    nextRestockDate: mockTimestamp,
    supplier: { id: mockId, name: "Pet Supplies Inc", contact: mockEmail },
  };

  const mockAnalyticsReport = {
    period: {
      start: mockTimestamp,
      end: mockTimestamp,
      type: "month" as const,
    },
    sales: {
      totalRevenue: 50000,
      totalOrders: 100,
      averageOrderValue: 500,
      conversionRate: 3.5,
      topSellingPets: [
        {
          petId: mockId,
          name: "Buddy",
          category: "Dogs",
          unitsSold: 20,
          revenue: 10000,
        },
      ],
      revenueByCategory: [
        {
          categoryId: mockId,
          categoryName: "Dogs",
          revenue: 30000,
          orders: 60,
        },
      ],
    },
    customers: {
      newCustomers: 50,
      returningCustomers: 50,
      churnRate: 5,
      customerLifetimeValue: 1000,
      averageOrdersPerCustomer: 2,
    },
    inventory: {
      lowStockItems: 5,
      outOfStockItems: 2,
      totalValue: 100000,
      turnoverRate: 4.5,
    },
    trends: [
      { date: mockTimestamp, revenue: 5000, orders: 10, newCustomers: 5 },
    ],
  };

  // Build the tRPC router
  const appRouter = t.router({
    // Pet procedures
    pet: t.router({
      list: t.procedure
        .input(
          PaginationInput.extend({
            status: PetStatus.optional(),
            categoryId: Id.optional(),
            minPrice: z.number().min(0).optional(),
            maxPrice: z.number().min(0).optional(),
            search: z.string().optional(),
          }),
        )
        .output(
          z.object({
            data: z.array(Pet),
            pagination: PaginationMeta,
          }),
        )
        .query(() => ({ data: [mockPet], pagination: mockPagination })),

      getById: t.procedure
        .input(z.object({ id: Id }))
        .output(Pet)
        .query(() => mockPet),

      create: t.procedure
        .input(CreatePetInput)
        .output(Pet)
        .mutation(() => mockPet),

      update: t.procedure
        .input(UpdatePetInput)
        .output(Pet)
        .mutation(() => mockPet),

      delete: t.procedure
        .input(z.object({ id: Id }))
        .output(z.object({ success: z.boolean() }))
        .mutation(() => ({ success: true })),

      uploadPhoto: t.procedure
        .input(
          z.object({
            petId: Id,
            photoUrl: Url,
            caption: z.string().max(200).optional(),
          }),
        )
        .output(Pet)
        .mutation(() => mockPet),
    }),

    // Order procedures
    order: t.router({
      list: t.procedure
        .input(
          PaginationInput.extend({
            customerId: Id.optional(),
            status: OrderStatus.optional(),
            startDate: Timestamp.optional(),
            endDate: Timestamp.optional(),
          }),
        )
        .output(
          z.object({
            data: z.array(Order),
            pagination: PaginationMeta,
          }),
        )
        .query(() => ({ data: [mockOrder], pagination: mockPagination })),

      getById: t.procedure
        .input(z.object({ id: Id }))
        .output(Order)
        .query(() => mockOrder),

      create: t.procedure
        .input(CreateOrderInput)
        .output(Order)
        .mutation(() => mockOrder),

      updateStatus: t.procedure
        .input(
          z.object({
            id: Id,
            status: OrderStatus,
            trackingNumber: z.string().optional(),
            cancellationReason: z.string().optional(),
          }),
        )
        .output(Order)
        .mutation(() => mockOrder),

      cancel: t.procedure
        .input(
          z.object({
            id: Id,
            reason: z.string(),
          }),
        )
        .output(Order)
        .mutation(() => mockOrder),
    }),

    // Customer procedures
    customer: t.router({
      register: t.procedure
        .input(RegisterInput)
        .output(Customer)
        .mutation(() => mockCustomer),

      me: t.procedure.output(Customer).query(() => mockCustomer),

      updateProfile: t.procedure
        .input(UpdateProfileInput)
        .output(Customer)
        .mutation(() => mockCustomer),

      addAddress: t.procedure
        .input(
          ShippingAddress.extend({
            type: z.enum(["home", "work", "other"]),
            isDefault: z.boolean().default(false),
          }),
        )
        .output(Customer)
        .mutation(() => mockCustomer),

      deleteAddress: t.procedure
        .input(z.object({ addressId: Id }))
        .output(Customer)
        .mutation(() => mockCustomer),
    }),

    // Review procedures
    review: t.router({
      list: t.procedure
        .input(
          PaginationInput.extend({
            petId: Id,
            minRating: z.number().int().min(1).max(5).optional(),
            verified: z.boolean().optional(),
          }),
        )
        .output(
          z.object({
            data: z.array(Review),
            pagination: PaginationMeta,
            averageRating: z.number().min(0).max(5),
            ratingDistribution: z.object({
              "5": z.number().int().min(0),
              "4": z.number().int().min(0),
              "3": z.number().int().min(0),
              "2": z.number().int().min(0),
              "1": z.number().int().min(0),
            }),
          }),
        )
        .query(() => ({
          data: [mockReview],
          pagination: mockPagination,
          averageRating: 4.5,
          ratingDistribution: { "5": 50, "4": 30, "3": 15, "2": 3, "1": 2 },
        })),

      getById: t.procedure
        .input(z.object({ id: Id }))
        .output(Review)
        .query(() => mockReview),

      create: t.procedure
        .input(CreateReviewInput)
        .output(Review)
        .mutation(() => mockReview),

      markHelpful: t.procedure
        .input(
          z.object({
            reviewId: Id,
            helpful: z.boolean(),
          }),
        )
        .output(Review)
        .mutation(() => mockReview),
    }),

    // Inventory procedures
    inventory: t.router({
      list: t.procedure
        .input(
          z.object({
            warehouseId: Id.optional(),
            lowStock: z.boolean().optional(),
            outOfStock: z.boolean().optional(),
          }),
        )
        .output(
          z.object({
            data: z.array(InventoryItem),
          }),
        )
        .query(() => ({ data: [mockInventoryItem] })),

      getByPetId: t.procedure
        .input(z.object({ petId: Id }))
        .output(z.array(InventoryItem))
        .query(() => [mockInventoryItem]),

      updateStock: t.procedure
        .input(
          z.object({
            petId: Id,
            warehouseId: Id,
            quantityChange: z.number().int(),
            reason: z.enum([
              "purchase",
              "return",
              "restock",
              "adjustment",
              "damage",
            ]),
          }),
        )
        .output(InventoryItem)
        .mutation(() => mockInventoryItem),
    }),

    // Analytics procedures
    analytics: t.router({
      sales: t.procedure
        .input(
          z.object({
            startDate: Timestamp,
            endDate: Timestamp,
            groupBy: z.enum(["day", "week", "month"]).default("day"),
          }),
        )
        .output(AnalyticsReport)
        .query(() => mockAnalyticsReport),

      dashboard: t.procedure
        .output(
          z.object({
            todaySales: z.number().min(0),
            todayOrders: z.number().int().min(0),
            pendingOrders: z.number().int().min(0),
            lowStockAlerts: z.number().int().min(0),
            newCustomers: z.number().int().min(0),
            recentOrders: z.array(Order).max(10),
            topProducts: z.array(Pet).max(5),
          }),
        )
        .query(() => ({
          todaySales: 5000,
          todayOrders: 10,
          pendingOrders: 5,
          lowStockAlerts: 3,
          newCustomers: 2,
          recentOrders: [mockOrder],
          topProducts: [mockPet],
        })),
    }),

    // Category procedures
    category: t.router({
      list: t.procedure.output(z.array(Category)).query(() => [mockCategory]),

      create: t.procedure
        .input(
          z.object({
            name: z.string().min(1).max(100),
            description: z.string().max(500).optional(),
            imageUrl: Url.optional(),
          }),
        )
        .output(Category)
        .mutation(() => mockCategory),
    }),
  });

  type AppRouter = typeof appRouter;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type AppRouterReadonly = DeepReadonly<AppRouter>;

  return {} as AppRouterReadonly;
})
  .mean([5.57, "ms"])
  .types([38241, "instantiations"]);
