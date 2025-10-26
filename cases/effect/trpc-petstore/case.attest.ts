import { bench } from "@ark/attest";
import { initTRPC } from "@trpc/server";
import * as S from "effect/Schema";

bench("effect/trpc-petstore typecheck", () => {
	const t = initTRPC.create();

	// Common schemas
	const Id = S.UUID;
	const Timestamp = S.DateTimeUtc;
	const Email = S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
	const Url = S.String.pipe(S.pattern(/^https?:\/\/.+/));

	const PaginationInput = S.Struct({
		page: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		limit: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(1),
			S.lessThanOrEqualTo(100),
		),
		sortBy: S.optional(S.Literal("name", "createdAt", "price")),
		sortOrder: S.optional(S.Literal("asc", "desc")),
	});

	const PaginationMeta = S.Struct({
		page: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		limit: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		total: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		totalPages: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
	});

	// Pet schemas
	const PetStatus = S.Literal("available", "pending", "sold");

	const Category = S.Struct({
		id: Id,
		name: S.String,
		description: S.optional(S.String),
		imageUrl: S.optional(Url),
	});

	const Tag = S.Struct({
		id: Id,
		name: S.String,
		color: S.optional(S.String.pipe(S.pattern(/^#[0-9A-Fa-f]{6}$/))),
	});

	const Vaccination = S.Struct({
		id: Id,
		name: S.String,
		date: S.DateFromString,
		expiresAt: S.optional(S.DateFromString),
		veterinarian: S.String,
	});

	const Pet = S.Struct({
		id: Id,
		name: S.String.pipe(S.minLength(1), S.maxLength(100)),
		category: Category,
		photoUrls: S.Array(Url),
		tags: S.Array(Tag),
		status: PetStatus,
		price: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		weight: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0.1))),
		age: S.optional(S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0))),
		birthDate: S.optional(S.DateFromString),
		breed: S.optional(S.String),
		description: S.optional(S.String.pipe(S.maxLength(1000))),
		vaccinations: S.optional(S.Array(Vaccination)),
		microchipId: S.optional(S.String),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreatePetInput = S.Struct({
		name: S.String.pipe(S.minLength(1), S.maxLength(100)),
		categoryId: Id,
		photoUrls: S.Array(Url),
		tagIds: S.Array(Id),
		status: S.optional(PetStatus),
		price: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		weight: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0.1))),
		birthDate: S.optional(S.DateFromString),
		breed: S.optional(S.String),
		description: S.optional(S.String.pipe(S.maxLength(1000))),
	});

	const UpdatePetInput = S.Struct({
		id: Id,
		name: S.optional(S.String.pipe(S.minLength(1), S.maxLength(100))),
		categoryId: S.optional(Id),
		photoUrls: S.optional(S.Array(Url)),
		tagIds: S.optional(S.Array(Id)),
		status: S.optional(PetStatus),
		price: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0))),
		weight: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0.1))),
		description: S.optional(S.String.pipe(S.maxLength(1000))),
	});

	// Order schemas
	const OrderStatus = S.Literal(
		"placed",
		"approved",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
	);
	const PaymentStatus = S.Literal("pending", "completed", "failed", "refunded");

	const ShippingAddress = S.Struct({
		street: S.String,
		unit: S.optional(S.String),
		city: S.String,
		state: S.String,
		zipCode: S.String.pipe(S.pattern(/^\d{5}(-\d{4})?$/)),
		country: S.Literal("US", "CA", "GB", "FR", "DE", "AU", "JP"),
		phone: S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/)),
	});

	const PaymentMethod = S.Union(
		S.Struct({
			type: S.Literal("credit_card"),
			last4: S.String.pipe(S.length(4)),
			brand: S.Literal("visa", "mastercard", "amex", "discover"),
			expiryMonth: S.Number.pipe(
				S.int(),
				S.greaterThanOrEqualTo(1),
				S.lessThanOrEqualTo(12),
			),
			expiryYear: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(2024)),
		}),
		S.Struct({
			type: S.Literal("paypal"),
			email: Email,
			transactionId: S.optional(S.String),
		}),
		S.Struct({
			type: S.Literal("bank_transfer"),
			accountNumber: S.String,
			routingNumber: S.String,
			bankName: S.String,
		}),
		S.Struct({
			type: S.Literal("crypto"),
			currency: S.Literal("BTC", "ETH", "USDC"),
			walletAddress: S.String,
			transactionHash: S.optional(S.String),
		}),
	);

	const OrderItem = S.Struct({
		petId: Id,
		pet: Pet,
		quantity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		priceAtTime: S.Number.pipe(S.greaterThanOrEqualTo(0)),
	});

	const Order = S.Struct({
		id: Id,
		orderNumber: S.String,
		customerId: Id,
		items: S.Array(OrderItem),
		status: OrderStatus,
		paymentStatus: PaymentStatus,
		shippingAddress: ShippingAddress,
		billingAddress: S.optional(ShippingAddress),
		paymentMethod: PaymentMethod,
		subtotal: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		tax: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		shipping: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		discount: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		total: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		notes: S.optional(S.String.pipe(S.maxLength(500))),
		trackingNumber: S.optional(S.String),
		estimatedDelivery: S.optional(Timestamp),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		paidAt: S.optional(Timestamp),
		shippedAt: S.optional(Timestamp),
		deliveredAt: S.optional(Timestamp),
		cancelledAt: S.optional(Timestamp),
		cancellationReason: S.optional(S.String),
	});

	const CreateOrderInput = S.Struct({
		items: S.Array(
			S.Struct({
				petId: Id,
				quantity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
			}),
		),
		shippingAddress: ShippingAddress,
		billingAddress: S.optional(ShippingAddress),
		paymentMethod: PaymentMethod,
		notes: S.optional(S.String.pipe(S.maxLength(500))),
	});

	// Customer schemas
	const CustomerAddress = S.Struct({
		id: Id,
		type: S.Literal("home", "work", "other"),
		street: S.String,
		unit: S.optional(S.String),
		city: S.String,
		state: S.String,
		zipCode: S.String.pipe(S.pattern(/^\d{5}(-\d{4})?$/)),
		country: S.Literal("US", "CA", "GB", "FR", "DE", "AU", "JP"),
		phone: S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/)),
		isDefault: S.Boolean,
	});

	const Customer = S.Struct({
		id: Id,
		email: Email,
		firstName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		lastName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
		dateOfBirth: S.optional(S.DateFromString),
		addresses: S.Array(CustomerAddress),
		preferences: S.Struct({
			newsletter: S.Boolean,
			smsNotifications: S.Boolean,
			emailNotifications: S.Boolean,
			favoriteCategories: S.Array(Id),
			preferredPaymentMethod: S.optional(
				S.Literal("credit_card", "paypal", "bank_transfer", "crypto"),
			),
		}),
		loyaltyPoints: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		membershipTier: S.Literal("bronze", "silver", "gold", "platinum"),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		lastLoginAt: S.optional(Timestamp),
		emailVerified: S.Boolean,
	});

	const RegisterInput = S.Struct({
		email: Email,
		password: S.String.pipe(S.minLength(8), S.maxLength(100)),
		firstName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		lastName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
		dateOfBirth: S.optional(S.DateFromString),
	});

	const UpdateProfileInput = S.Struct({
		firstName: S.optional(S.String.pipe(S.minLength(1), S.maxLength(50))),
		lastName: S.optional(S.String.pipe(S.minLength(1), S.maxLength(50))),
		phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
		dateOfBirth: S.optional(S.DateFromString),
		preferences: S.optional(
			S.Struct({
				newsletter: S.Boolean,
				smsNotifications: S.Boolean,
				emailNotifications: S.Boolean,
				favoriteCategories: S.Array(Id),
				preferredPaymentMethod: S.optional(
					S.Literal("credit_card", "paypal", "bank_transfer", "crypto"),
				),
			}),
		),
	});

	// Review schemas
	const Review = S.Struct({
		id: Id,
		petId: Id,
		customerId: Id,
		customer: S.Struct({
			id: Id,
			firstName: S.String,
			lastName: S.String,
			membershipTier: S.Literal("bronze", "silver", "gold", "platinum"),
		}),
		rating: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(1),
			S.lessThanOrEqualTo(5),
		),
		title: S.String.pipe(S.minLength(1), S.maxLength(200)),
		comment: S.String.pipe(S.minLength(1), S.maxLength(2000)),
		images: S.optional(
			S.Array(
				S.Struct({
					id: Id,
					url: Url,
					caption: S.optional(S.String),
				}),
			),
		),
		pros: S.optional(S.Array(S.String)),
		cons: S.optional(S.Array(S.String)),
		wouldRecommend: S.Boolean,
		helpful: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		notHelpful: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		verified: S.Boolean,
		response: S.optional(
			S.Struct({
				text: S.String,
				respondedAt: Timestamp,
				respondedBy: S.String,
			}),
		),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreateReviewInput = S.Struct({
		petId: Id,
		rating: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(1),
			S.lessThanOrEqualTo(5),
		),
		title: S.String.pipe(S.minLength(1), S.maxLength(200)),
		comment: S.String.pipe(S.minLength(1), S.maxLength(2000)),
		images: S.optional(
			S.Array(
				S.Struct({
					url: Url,
					caption: S.optional(S.String),
				}),
			),
		),
		pros: S.optional(S.Array(S.String)),
		cons: S.optional(S.Array(S.String)),
		wouldRecommend: S.Boolean,
	});

	// Inventory schemas
	const Warehouse = S.Struct({
		id: Id,
		name: S.String,
		code: S.String,
		location: S.Struct({
			address: S.String,
			city: S.String,
			state: S.String,
			country: S.String,
			coordinates: S.optional(
				S.Struct({
					lat: S.Number.pipe(
						S.greaterThanOrEqualTo(-90),
						S.lessThanOrEqualTo(90),
					),
					lng: S.Number.pipe(
						S.greaterThanOrEqualTo(-180),
						S.lessThanOrEqualTo(180),
					),
				}),
			),
		}),
		capacity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		isActive: S.Boolean,
	});

	const InventoryItem = S.Struct({
		petId: Id,
		pet: Pet,
		quantityAvailable: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		quantityReserved: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		quantityInTransit: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		reorderLevel: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		reorderQuantity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		warehouse: Warehouse,
		location: S.optional(
			S.Struct({
				aisle: S.String,
				shelf: S.String,
				bin: S.String,
			}),
		),
		lastRestocked: S.optional(Timestamp),
		nextRestockDate: S.optional(Timestamp),
		supplier: S.optional(
			S.Struct({
				id: Id,
				name: S.String,
				contact: Email,
			}),
		),
	});

	// Analytics schemas
	const SalesMetrics = S.Struct({
		totalRevenue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		totalOrders: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		averageOrderValue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		conversionRate: S.Number.pipe(
			S.greaterThanOrEqualTo(0),
			S.lessThanOrEqualTo(100),
		),
		topSellingPets: S.Array(
			S.Struct({
				petId: Id,
				name: S.String,
				category: S.String,
				unitsSold: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
				revenue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
			}),
		),
		revenueByCategory: S.Array(
			S.Struct({
				categoryId: Id,
				categoryName: S.String,
				revenue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
				orders: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			}),
		),
	});

	const CustomerMetrics = S.Struct({
		newCustomers: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		returningCustomers: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		churnRate: S.Number.pipe(
			S.greaterThanOrEqualTo(0),
			S.lessThanOrEqualTo(100),
		),
		customerLifetimeValue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		averageOrdersPerCustomer: S.Number.pipe(S.greaterThanOrEqualTo(0)),
	});

	const InventoryMetrics = S.Struct({
		lowStockItems: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		outOfStockItems: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		totalValue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		turnoverRate: S.Number.pipe(S.greaterThanOrEqualTo(0)),
	});

	const AnalyticsReport = S.Struct({
		period: S.Struct({
			start: Timestamp,
			end: Timestamp,
			type: S.Literal("day", "week", "month", "quarter", "year"),
		}),
		sales: SalesMetrics,
		customers: CustomerMetrics,
		inventory: InventoryMetrics,
		trends: S.Array(
			S.Struct({
				date: Timestamp,
				revenue: S.Number,
				orders: S.Number.pipe(S.int()),
				newCustomers: S.Number.pipe(S.int()),
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
		date: "2024-01-01T00:00:00.000Z",
		expiresAt: "2025-01-01T00:00:00.000Z",
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
		birthDate: "2022-01-01T00:00:00.000Z",
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
		dateOfBirth: "1990-01-01T00:00:00.000Z",
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
			{
				date: mockTimestamp,
				revenue: 5000,
				orders: 10,
				newCustomers: 5,
			},
		],
	};

	// Build the tRPC router
	const appRouter = t.router({
		// Pet procedures
		pet: t.router({
			list: t.procedure
				.input(
					S.standardSchemaV1(
						S.extend(
							PaginationInput,
							S.Struct({
								status: S.optional(PetStatus),
								categoryId: S.optional(Id),
								minPrice: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0))),
								maxPrice: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0))),
								search: S.optional(S.String),
							}),
						),
					),
				)
				.output(
					S.standardSchemaV1(
						S.Struct({
							data: S.Array(Pet),
							pagination: PaginationMeta,
						}),
					),
				)
				.query(() => ({ data: [mockPet], pagination: mockPagination })),

			getById: t.procedure
				.input(S.standardSchemaV1(S.Struct({ id: Id })))
				.output(S.standardSchemaV1(Pet))
				.query(() => mockPet),

			create: t.procedure
				.input(S.standardSchemaV1(CreatePetInput))
				.output(S.standardSchemaV1(Pet))
				.mutation(() => mockPet),

			update: t.procedure
				.input(S.standardSchemaV1(UpdatePetInput))
				.output(S.standardSchemaV1(Pet))
				.mutation(() => mockPet),

			delete: t.procedure
				.input(S.standardSchemaV1(S.Struct({ id: Id })))
				.output(S.standardSchemaV1(S.Struct({ success: S.Boolean })))
				.mutation(() => ({ success: true })),

			uploadPhoto: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							petId: Id,
							photoUrl: Url,
							caption: S.optional(S.String.pipe(S.maxLength(200))),
						}),
					),
				)
				.output(S.standardSchemaV1(Pet))
				.mutation(() => mockPet),
		}),

		// Order procedures
		order: t.router({
			list: t.procedure
				.input(
					S.standardSchemaV1(
						S.extend(
							PaginationInput,
							S.Struct({
								customerId: S.optional(Id),
								status: S.optional(OrderStatus),
								startDate: S.optional(Timestamp),
								endDate: S.optional(Timestamp),
							}),
						),
					),
				)
				.output(
					S.standardSchemaV1(
						S.Struct({
							data: S.Array(Order),
							pagination: PaginationMeta,
						}),
					),
				)
				.query(() => ({ data: [mockOrder], pagination: mockPagination })),

			getById: t.procedure
				.input(S.standardSchemaV1(S.Struct({ id: Id })))
				.output(S.standardSchemaV1(Order))
				.query(() => mockOrder),

			create: t.procedure
				.input(S.standardSchemaV1(CreateOrderInput))
				.output(S.standardSchemaV1(Order))
				.mutation(() => mockOrder),

			updateStatus: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							id: Id,
							status: OrderStatus,
							trackingNumber: S.optional(S.String),
							cancellationReason: S.optional(S.String),
						}),
					),
				)
				.output(S.standardSchemaV1(Order))
				.mutation(() => mockOrder),

			cancel: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							id: Id,
							reason: S.String,
						}),
					),
				)
				.output(S.standardSchemaV1(Order))
				.mutation(() => mockOrder),
		}),

		// Customer procedures
		customer: t.router({
			register: t.procedure
				.input(S.standardSchemaV1(RegisterInput))
				.output(S.standardSchemaV1(Customer))
				.mutation(() => mockCustomer),

			me: t.procedure
				.output(S.standardSchemaV1(Customer))
				.query(() => mockCustomer),

			updateProfile: t.procedure
				.input(S.standardSchemaV1(UpdateProfileInput))
				.output(S.standardSchemaV1(Customer))
				.mutation(() => mockCustomer),

			addAddress: t.procedure
				.input(
					S.standardSchemaV1(
						S.extend(
							ShippingAddress,
							S.Struct({
								type: S.Literal("home", "work", "other"),
								isDefault: S.Boolean,
							}),
						),
					),
				)
				.output(S.standardSchemaV1(Customer))
				.mutation(() => mockCustomer),

			deleteAddress: t.procedure
				.input(S.standardSchemaV1(S.Struct({ addressId: Id })))
				.output(S.standardSchemaV1(Customer))
				.mutation(() => mockCustomer),
		}),

		// Review procedures
		review: t.router({
			list: t.procedure
				.input(
					S.standardSchemaV1(
						S.extend(
							PaginationInput,
							S.Struct({
								petId: Id,
								minRating: S.optional(
									S.Number.pipe(
										S.int(),
										S.greaterThanOrEqualTo(1),
										S.lessThanOrEqualTo(5),
									),
								),
								verified: S.optional(S.Boolean),
							}),
						),
					),
				)
				.output(
					S.standardSchemaV1(
						S.Struct({
							data: S.Array(Review),
							pagination: PaginationMeta,
							averageRating: S.Number.pipe(
								S.greaterThanOrEqualTo(0),
								S.lessThanOrEqualTo(5),
							),
							ratingDistribution: S.Struct({
								"5": S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
								"4": S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
								"3": S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
								"2": S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
								"1": S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
							}),
						}),
					),
				)
				.query(() => ({
					data: [mockReview],
					pagination: mockPagination,
					averageRating: 4.5,
					ratingDistribution: { "5": 50, "4": 30, "3": 15, "2": 3, "1": 2 },
				})),

			getById: t.procedure
				.input(S.standardSchemaV1(S.Struct({ id: Id })))
				.output(S.standardSchemaV1(Review))
				.query(() => mockReview),

			create: t.procedure
				.input(S.standardSchemaV1(CreateReviewInput))
				.output(S.standardSchemaV1(Review))
				.mutation(() => mockReview),

			markHelpful: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							reviewId: Id,
							helpful: S.Boolean,
						}),
					),
				)
				.output(S.standardSchemaV1(Review))
				.mutation(() => mockReview),
		}),

		// Inventory procedures
		inventory: t.router({
			list: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							warehouseId: S.optional(Id),
							lowStock: S.optional(S.Boolean),
							outOfStock: S.optional(S.Boolean),
						}),
					),
				)
				.output(
					S.standardSchemaV1(
						S.Struct({
							data: S.Array(InventoryItem),
						}),
					),
				)
				.query(() => ({ data: [mockInventoryItem] })),

			getByPetId: t.procedure
				.input(S.standardSchemaV1(S.Struct({ petId: Id })))
				.output(S.standardSchemaV1(S.Array(InventoryItem)))
				.query(() => [mockInventoryItem]),

			updateStock: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							petId: Id,
							warehouseId: Id,
							quantityChange: S.Number.pipe(S.int()),
							reason: S.Literal(
								"purchase",
								"return",
								"restock",
								"adjustment",
								"damage",
							),
						}),
					),
				)
				.output(S.standardSchemaV1(InventoryItem))
				.mutation(() => mockInventoryItem),
		}),

		// Analytics procedures
		analytics: t.router({
			sales: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							startDate: Timestamp,
							endDate: Timestamp,
							groupBy: S.Literal("day", "week", "month"),
						}),
					),
				)
				.output(S.standardSchemaV1(AnalyticsReport))
				.query(() => mockAnalyticsReport),

			dashboard: t.procedure
				.output(
					S.standardSchemaV1(
						S.Struct({
							todaySales: S.Number.pipe(S.greaterThanOrEqualTo(0)),
							todayOrders: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
							pendingOrders: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
							lowStockAlerts: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
							newCustomers: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
							recentOrders: S.Array(Order).pipe(S.maxItems(10)),
							topProducts: S.Array(Pet).pipe(S.maxItems(5)),
						}),
					),
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
			list: t.procedure
				.output(S.standardSchemaV1(S.Array(Category)))
				.query(() => [mockCategory]),

			create: t.procedure
				.input(
					S.standardSchemaV1(
						S.Struct({
							name: S.String.pipe(S.minLength(1), S.maxLength(100)),
							description: S.optional(S.String.pipe(S.maxLength(500))),
							imageUrl: S.optional(Url),
						}),
					),
				)
				.output(S.standardSchemaV1(Category))
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
	.mean([3.69, "ms"])
	.types([95452, "instantiations"]);
