import { bench } from "@ark/attest";
import { initTRPC } from "@trpc/server";
import * as v from "valibot";

bench("valibot/trpc-petstore typecheck", () => {
	const t = initTRPC.create();

	// Common schemas
	const Id = v.pipe(v.string(), v.uuid());
	const Timestamp = v.pipe(v.string(), v.isoDateTime());
	const Email = v.pipe(v.string(), v.email());
	const Url = v.pipe(v.string(), v.url());

	// Mock data generators
	const mockId = "550e8400-e29b-41d4-a716-446655440000";
	const mockTimestamp = "2024-01-01T00:00:00.000Z";
	const mockEmail = "test@example.com";
	const mockUrl = "https://example.com/image.jpg";

	const PaginationInput = v.object({
		page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
		limit: v.optional(
			v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
			20,
		),
		sortBy: v.optional(v.picklist(["name", "createdAt", "price"])),
		sortOrder: v.optional(v.picklist(["asc", "desc"]), "asc"),
	});

	const PaginationMeta = v.object({
		page: v.pipe(v.number(), v.integer(), v.minValue(1)),
		limit: v.pipe(v.number(), v.integer(), v.minValue(1)),
		total: v.pipe(v.number(), v.integer(), v.minValue(0)),
		totalPages: v.pipe(v.number(), v.integer(), v.minValue(0)),
	});

	// Pet schemas
	const PetStatus = v.picklist(["available", "pending", "sold"]);

	const Category = v.object({
		id: Id,
		name: v.string(),
		description: v.optional(v.string()),
		imageUrl: v.optional(Url),
	});

	const Tag = v.object({
		id: Id,
		name: v.string(),
		color: v.optional(v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/))),
	});

	const Vaccination = v.object({
		id: Id,
		name: v.string(),
		date: v.pipe(v.string(), v.isoDate()),
		expiresAt: v.optional(v.pipe(v.string(), v.isoDate())),
		veterinarian: v.string(),
	});

	const Pet = v.object({
		id: Id,
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
		category: Category,
		photoUrls: v.array(Url),
		tags: v.array(Tag),
		status: PetStatus,
		price: v.pipe(v.number(), v.minValue(0)),
		weight: v.optional(v.pipe(v.number(), v.minValue(0.1))),
		age: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
		birthDate: v.optional(v.pipe(v.string(), v.isoDate())),
		breed: v.optional(v.string()),
		description: v.optional(v.pipe(v.string(), v.maxLength(1000))),
		vaccinations: v.optional(v.array(Vaccination)),
		microchipId: v.optional(v.string()),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreatePetInput = v.object({
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
		categoryId: Id,
		photoUrls: v.array(Url),
		tagIds: v.array(Id),
		status: v.optional(PetStatus, "available"),
		price: v.pipe(v.number(), v.minValue(0)),
		weight: v.optional(v.pipe(v.number(), v.minValue(0.1))),
		birthDate: v.optional(v.pipe(v.string(), v.isoDate())),
		breed: v.optional(v.string()),
		description: v.optional(v.pipe(v.string(), v.maxLength(1000))),
	});

	const UpdatePetInput = v.object({
		id: Id,
		name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
		categoryId: v.optional(Id),
		photoUrls: v.optional(v.array(Url)),
		tagIds: v.optional(v.array(Id)),
		status: v.optional(PetStatus),
		price: v.optional(v.pipe(v.number(), v.minValue(0))),
		weight: v.optional(v.pipe(v.number(), v.minValue(0.1))),
		description: v.optional(v.pipe(v.string(), v.maxLength(1000))),
	});

	// Order schemas
	const OrderStatus = v.picklist([
		"placed",
		"approved",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
	]);
	const PaymentStatus = v.picklist([
		"pending",
		"completed",
		"failed",
		"refunded",
	]);

	const ShippingAddress = v.object({
		street: v.string(),
		unit: v.optional(v.string()),
		city: v.string(),
		state: v.string(),
		zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
		country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
		phone: v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/)),
	});

	const PaymentMethod = v.variant("type", [
		v.object({
			type: v.literal("credit_card"),
			last4: v.pipe(v.string(), v.length(4)),
			brand: v.picklist(["visa", "mastercard", "amex", "discover"]),
			expiryMonth: v.pipe(
				v.number(),
				v.integer(),
				v.minValue(1),
				v.maxValue(12),
			),
			expiryYear: v.pipe(v.number(), v.integer(), v.minValue(2024)),
		}),
		v.object({
			type: v.literal("paypal"),
			email: Email,
			transactionId: v.optional(v.string()),
		}),
		v.object({
			type: v.literal("bank_transfer"),
			accountNumber: v.string(),
			routingNumber: v.string(),
			bankName: v.string(),
		}),
		v.object({
			type: v.literal("crypto"),
			currency: v.picklist(["BTC", "ETH", "USDC"]),
			walletAddress: v.string(),
			transactionHash: v.optional(v.string()),
		}),
	]);

	const OrderItem = v.object({
		petId: Id,
		pet: Pet,
		quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
		priceAtTime: v.pipe(v.number(), v.minValue(0)),
	});

	const Order = v.object({
		id: Id,
		orderNumber: v.string(),
		customerId: Id,
		items: v.array(OrderItem),
		status: OrderStatus,
		paymentStatus: PaymentStatus,
		shippingAddress: ShippingAddress,
		billingAddress: v.optional(ShippingAddress),
		paymentMethod: PaymentMethod,
		subtotal: v.pipe(v.number(), v.minValue(0)),
		tax: v.pipe(v.number(), v.minValue(0)),
		shipping: v.pipe(v.number(), v.minValue(0)),
		discount: v.optional(v.pipe(v.number(), v.minValue(0)), 0),
		total: v.pipe(v.number(), v.minValue(0)),
		notes: v.optional(v.pipe(v.string(), v.maxLength(500))),
		trackingNumber: v.optional(v.string()),
		estimatedDelivery: v.optional(Timestamp),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		paidAt: v.optional(Timestamp),
		shippedAt: v.optional(Timestamp),
		deliveredAt: v.optional(Timestamp),
		cancelledAt: v.optional(Timestamp),
		cancellationReason: v.optional(v.string()),
	});

	const CreateOrderInput = v.object({
		items: v.array(
			v.object({
				petId: Id,
				quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
			}),
		),
		shippingAddress: ShippingAddress,
		billingAddress: v.optional(ShippingAddress),
		paymentMethod: PaymentMethod,
		notes: v.optional(v.pipe(v.string(), v.maxLength(500))),
	});

	// Customer schemas
	const Customer = v.object({
		id: Id,
		email: Email,
		firstName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		lastName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
		dateOfBirth: v.optional(v.pipe(v.string(), v.isoDate())),
		addresses: v.array(
			v.object({
				id: Id,
				type: v.picklist(["home", "work", "other"]),
				street: v.string(),
				unit: v.optional(v.string()),
				city: v.string(),
				state: v.string(),
				zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
				country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
				phone: v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/)),
				isDefault: v.boolean(),
			}),
		),
		preferences: v.object({
			newsletter: v.boolean(),
			smsNotifications: v.boolean(),
			emailNotifications: v.boolean(),
			favoriteCategories: v.array(Id),
			preferredPaymentMethod: v.optional(
				v.picklist(["credit_card", "paypal", "bank_transfer", "crypto"]),
			),
		}),
		loyaltyPoints: v.pipe(v.number(), v.integer(), v.minValue(0)),
		membershipTier: v.picklist(["bronze", "silver", "gold", "platinum"]),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		lastLoginAt: v.optional(Timestamp),
		emailVerified: v.boolean(),
	});

	const RegisterInput = v.object({
		email: Email,
		password: v.pipe(v.string(), v.minLength(8), v.maxLength(100)),
		firstName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		lastName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
		dateOfBirth: v.optional(v.pipe(v.string(), v.isoDate())),
	});

	const UpdateProfileInput = v.object({
		firstName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(50))),
		lastName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(50))),
		phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
		dateOfBirth: v.optional(v.pipe(v.string(), v.isoDate())),
		preferences: v.optional(
			v.object({
				newsletter: v.boolean(),
				smsNotifications: v.boolean(),
				emailNotifications: v.boolean(),
				favoriteCategories: v.array(Id),
				preferredPaymentMethod: v.optional(
					v.picklist(["credit_card", "paypal", "bank_transfer", "crypto"]),
				),
			}),
		),
	});

	// Review schemas
	const ReviewImage = v.object({
		id: Id,
		url: Url,
		caption: v.optional(v.pipe(v.string(), v.maxLength(200))),
	});

	const Review = v.object({
		id: Id,
		petId: Id,
		customerId: Id,
		customer: v.object({
			id: Id,
			firstName: v.string(),
			lastName: v.string(),
			membershipTier: v.picklist(["bronze", "silver", "gold", "platinum"]),
		}),
		rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
		title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
		comment: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
		images: v.optional(v.array(ReviewImage)),
		pros: v.optional(v.array(v.string())),
		cons: v.optional(v.array(v.string())),
		wouldRecommend: v.boolean(),
		helpful: v.pipe(v.number(), v.integer(), v.minValue(0)),
		notHelpful: v.pipe(v.number(), v.integer(), v.minValue(0)),
		verified: v.boolean(),
		response: v.optional(
			v.object({
				text: v.string(),
				respondedAt: Timestamp,
				respondedBy: v.string(),
			}),
		),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreateReviewInput = v.object({
		petId: Id,
		orderId: Id,
		rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
		title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
		comment: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
		images: v.optional(v.array(Url)),
		pros: v.optional(v.array(v.pipe(v.string(), v.maxLength(100)))),
		cons: v.optional(v.array(v.pipe(v.string(), v.maxLength(100)))),
		wouldRecommend: v.boolean(),
	});

	// Inventory schemas
	const Warehouse = v.object({
		id: Id,
		name: v.string(),
		code: v.string(),
		location: v.object({
			address: v.string(),
			city: v.string(),
			state: v.string(),
			country: v.string(),
			coordinates: v.optional(
				v.object({
					lat: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
					lng: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
				}),
			),
		}),
		capacity: v.pipe(v.number(), v.integer(), v.minValue(0)),
		isActive: v.boolean(),
	});

	const InventoryItem = v.object({
		petId: Id,
		pet: Pet,
		quantityAvailable: v.pipe(v.number(), v.integer(), v.minValue(0)),
		quantityReserved: v.pipe(v.number(), v.integer(), v.minValue(0)),
		quantityInTransit: v.pipe(v.number(), v.integer(), v.minValue(0)),
		reorderLevel: v.pipe(v.number(), v.integer(), v.minValue(0)),
		reorderQuantity: v.pipe(v.number(), v.integer(), v.minValue(0)),
		warehouse: Warehouse,
		location: v.optional(
			v.object({
				aisle: v.string(),
				shelf: v.string(),
				bin: v.string(),
			}),
		),
		lastRestocked: v.optional(Timestamp),
		nextRestockDate: v.optional(Timestamp),
		supplier: v.optional(
			v.object({
				id: Id,
				name: v.string(),
				contact: Email,
			}),
		),
	});

	// Analytics schemas
	const SalesMetrics = v.object({
		totalRevenue: v.pipe(v.number(), v.minValue(0)),
		totalOrders: v.pipe(v.number(), v.integer(), v.minValue(0)),
		averageOrderValue: v.pipe(v.number(), v.minValue(0)),
		conversionRate: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
		topSellingPets: v.array(
			v.object({
				petId: Id,
				name: v.string(),
				category: v.string(),
				unitsSold: v.pipe(v.number(), v.integer(), v.minValue(0)),
				revenue: v.pipe(v.number(), v.minValue(0)),
			}),
		),
		revenueByCategory: v.array(
			v.object({
				categoryId: Id,
				categoryName: v.string(),
				revenue: v.pipe(v.number(), v.minValue(0)),
				orders: v.pipe(v.number(), v.integer(), v.minValue(0)),
			}),
		),
	});

	const CustomerMetrics = v.object({
		newCustomers: v.pipe(v.number(), v.integer(), v.minValue(0)),
		returningCustomers: v.pipe(v.number(), v.integer(), v.minValue(0)),
		churnRate: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
		customerLifetimeValue: v.pipe(v.number(), v.minValue(0)),
		averageOrdersPerCustomer: v.pipe(v.number(), v.minValue(0)),
	});

	const InventoryMetrics = v.object({
		lowStockItems: v.pipe(v.number(), v.integer(), v.minValue(0)),
		outOfStockItems: v.pipe(v.number(), v.integer(), v.minValue(0)),
		totalValue: v.pipe(v.number(), v.minValue(0)),
		turnoverRate: v.pipe(v.number(), v.minValue(0)),
	});

	const AnalyticsReport = v.object({
		period: v.object({
			start: Timestamp,
			end: Timestamp,
			type: v.picklist(["day", "week", "month", "quarter", "year"]),
		}),
		sales: SalesMetrics,
		customers: CustomerMetrics,
		inventory: InventoryMetrics,
		trends: v.array(
			v.object({
				date: Timestamp,
				revenue: v.number(),
				orders: v.pipe(v.number(), v.integer()),
				newCustomers: v.pipe(v.number(), v.integer()),
			}),
		),
	});

	// Mock data factories
	const mockCategory = {
		id: mockId,
		name: "Dogs",
		description: "Dog category",
		imageUrl: mockUrl,
	};

	const mockTag = {
		id: mockId,
		name: "friendly",
		color: "#FF0000",
	};

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
		price: 99.99,
		weight: 10.5,
		age: 2,
		birthDate: "2022-01-01",
		breed: "Golden Retriever",
		description: "Friendly dog",
		vaccinations: [mockVaccination],
		microchipId: "123456789",
		createdAt: mockTimestamp,
		updatedAt: mockTimestamp,
	};

	const mockShippingAddress = {
		street: "123 Main St",
		unit: "Apt 1",
		city: "New York",
		state: "NY",
		zipCode: "10001",
		country: "US" as const,
		phone: "+1-555-0100",
	};

	const mockPaymentMethod = {
		type: "credit_card" as const,
		last4: "4242",
		brand: "visa" as const,
		expiryMonth: 12,
		expiryYear: 2025,
	};

	const mockOrderItem = {
		petId: mockId,
		pet: mockPet,
		quantity: 1,
		priceAtTime: 99.99,
	};

	const mockOrder = {
		id: mockId,
		orderNumber: "ORD-123456",
		customerId: mockId,
		items: [mockOrderItem],
		status: "placed" as const,
		paymentStatus: "completed" as const,
		shippingAddress: mockShippingAddress,
		billingAddress: mockShippingAddress,
		paymentMethod: mockPaymentMethod,
		subtotal: 99.99,
		tax: 8.99,
		shipping: 5.0,
		discount: 0,
		total: 113.98,
		notes: "Please handle with care",
		trackingNumber: "TRACK123",
		estimatedDelivery: mockTimestamp,
		createdAt: mockTimestamp,
		updatedAt: mockTimestamp,
		paidAt: mockTimestamp,
		shippedAt: mockTimestamp,
		deliveredAt: mockTimestamp,
	};

	const mockCustomer = {
		id: mockId,
		email: mockEmail,
		firstName: "John",
		lastName: "Doe",
		phone: "+1-555-0100",
		dateOfBirth: "1990-01-01",
		addresses: [
			{
				id: mockId,
				type: "home" as const,
				street: "123 Main St",
				unit: "Apt 1",
				city: "New York",
				state: "NY",
				zipCode: "10001",
				country: "US" as const,
				phone: "+1-555-0100",
				isDefault: true,
			},
		],
		preferences: {
			newsletter: true,
			smsNotifications: true,
			emailNotifications: true,
			favoriteCategories: [mockId],
			preferredPaymentMethod: "credit_card" as const,
		},
		loyaltyPoints: 100,
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
		title: "Excellent pet!",
		comment: "Very friendly and well-behaved.",
		images: [{ id: mockId, url: mockUrl, caption: "Great photo" }],
		pros: ["Friendly", "Healthy"],
		cons: [],
		wouldRecommend: true,
		helpful: 10,
		notHelpful: 0,
		verified: true,
		response: {
			text: "Thank you for your review!",
			respondedAt: mockTimestamp,
			respondedBy: "Store Manager",
		},
		createdAt: mockTimestamp,
		updatedAt: mockTimestamp,
	};

	const mockWarehouse = {
		id: mockId,
		name: "Main Warehouse",
		code: "WH-001",
		location: {
			address: "123 Warehouse St",
			city: "New York",
			state: "NY",
			country: "US",
			coordinates: {
				lat: 40.7128,
				lng: -74.006,
			},
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
		reorderQuantity: 100,
		warehouse: mockWarehouse,
		location: {
			aisle: "A1",
			shelf: "S2",
			bin: "B3",
		},
		lastRestocked: mockTimestamp,
		nextRestockDate: mockTimestamp,
		supplier: {
			id: mockId,
			name: "Pet Supplies Inc",
			contact: mockEmail,
		},
	};

	const mockPaginationMeta = {
		page: 1,
		limit: 20,
		total: 100,
		totalPages: 5,
	};

	// Build the tRPC router
	const appRouter = t.router({
		// Pet procedures
		pet: t.router({
			list: t.procedure
				.input(
					v.object({
						...PaginationInput.entries,
						status: v.optional(PetStatus),
						categoryId: v.optional(Id),
						minPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
						maxPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
						search: v.optional(v.string()),
					}),
				)
				.output(
					v.object({
						data: v.array(Pet),
						pagination: PaginationMeta,
					}),
				)
				.query(() => ({ data: [mockPet], pagination: mockPaginationMeta })),

			getById: t.procedure
				.input(v.object({ id: Id }))
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
				.input(v.object({ id: Id }))
				.output(v.object({ success: v.boolean() }))
				.mutation(() => ({ success: true })),

			uploadPhoto: t.procedure
				.input(
					v.object({
						petId: Id,
						photoUrl: Url,
						caption: v.optional(v.pipe(v.string(), v.maxLength(200))),
					}),
				)
				.output(Pet)
				.mutation(() => mockPet),
		}),

		// Order procedures
		order: t.router({
			list: t.procedure
				.input(
					v.object({
						...PaginationInput.entries,
						customerId: v.optional(Id),
						status: v.optional(OrderStatus),
						startDate: v.optional(Timestamp),
						endDate: v.optional(Timestamp),
					}),
				)
				.output(
					v.object({
						data: v.array(Order),
						pagination: PaginationMeta,
					}),
				)
				.query(() => ({ data: [mockOrder], pagination: mockPaginationMeta })),

			getById: t.procedure
				.input(v.object({ id: Id }))
				.output(Order)
				.query(() => mockOrder),

			create: t.procedure
				.input(CreateOrderInput)
				.output(Order)
				.mutation(() => mockOrder),

			updateStatus: t.procedure
				.input(
					v.object({
						id: Id,
						status: OrderStatus,
						trackingNumber: v.optional(v.string()),
						cancellationReason: v.optional(v.string()),
					}),
				)
				.output(Order)
				.mutation(() => mockOrder),

			cancel: t.procedure
				.input(
					v.object({
						id: Id,
						reason: v.string(),
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
					v.object({
						...ShippingAddress.entries,
						type: v.picklist(["home", "work", "other"]),
						isDefault: v.optional(v.boolean(), false),
					}),
				)
				.output(Customer)
				.mutation(() => mockCustomer),

			deleteAddress: t.procedure
				.input(v.object({ addressId: Id }))
				.output(Customer)
				.mutation(() => mockCustomer),
		}),

		// Review procedures
		review: t.router({
			list: t.procedure
				.input(
					v.object({
						...PaginationInput.entries,
						petId: Id,
						minRating: v.optional(
							v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
						),
						verified: v.optional(v.boolean()),
					}),
				)
				.output(
					v.object({
						data: v.array(Review),
						pagination: PaginationMeta,
						averageRating: v.pipe(v.number(), v.minValue(0), v.maxValue(5)),
						ratingDistribution: v.object({
							"5": v.pipe(v.number(), v.integer(), v.minValue(0)),
							"4": v.pipe(v.number(), v.integer(), v.minValue(0)),
							"3": v.pipe(v.number(), v.integer(), v.minValue(0)),
							"2": v.pipe(v.number(), v.integer(), v.minValue(0)),
							"1": v.pipe(v.number(), v.integer(), v.minValue(0)),
						}),
					}),
				)
				.query(() => ({
					data: [mockReview],
					pagination: mockPaginationMeta,
					averageRating: 4.5,
					ratingDistribution: { "5": 50, "4": 30, "3": 15, "2": 3, "1": 2 },
				})),

			getById: t.procedure
				.input(v.object({ id: Id }))
				.output(Review)
				.query(() => mockReview),

			create: t.procedure
				.input(CreateReviewInput)
				.output(Review)
				.mutation(() => mockReview),

			markHelpful: t.procedure
				.input(
					v.object({
						reviewId: Id,
						helpful: v.boolean(),
					}),
				)
				.output(Review)
				.mutation(() => mockReview),
		}),

		// Inventory procedures
		inventory: t.router({
			list: t.procedure
				.input(
					v.object({
						warehouseId: v.optional(Id),
						lowStock: v.optional(v.boolean()),
						outOfStock: v.optional(v.boolean()),
					}),
				)
				.output(
					v.object({
						data: v.array(InventoryItem),
					}),
				)
				.query(() => ({ data: [mockInventoryItem] })),

			getByPetId: t.procedure
				.input(v.object({ petId: Id }))
				.output(v.array(InventoryItem))
				.query(() => [mockInventoryItem]),

			updateStock: t.procedure
				.input(
					v.object({
						petId: Id,
						warehouseId: Id,
						quantityChange: v.pipe(v.number(), v.integer()),
						reason: v.picklist([
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
					v.object({
						startDate: Timestamp,
						endDate: Timestamp,
						groupBy: v.optional(v.picklist(["day", "week", "month"]), "day"),
					}),
				)
				.output(AnalyticsReport)
				.query(() => ({
					period: {
						start: mockTimestamp,
						end: mockTimestamp,
						type: "day" as const,
					},
					sales: {
						totalRevenue: 10000,
						totalOrders: 100,
						averageOrderValue: 100,
						conversionRate: 5.5,
						topSellingPets: [
							{
								petId: mockId,
								name: "Buddy",
								category: "Dogs",
								unitsSold: 10,
								revenue: 999.9,
							},
						],
						revenueByCategory: [
							{
								categoryId: mockId,
								categoryName: "Dogs",
								revenue: 5000,
								orders: 50,
							},
						],
					},
					customers: {
						newCustomers: 20,
						returningCustomers: 80,
						churnRate: 5,
						customerLifetimeValue: 500,
						averageOrdersPerCustomer: 2.5,
					},
					inventory: {
						lowStockItems: 5,
						outOfStockItems: 2,
						totalValue: 50000,
						turnoverRate: 4.2,
					},
					trends: [
						{
							date: mockTimestamp,
							revenue: 1000,
							orders: 10,
							newCustomers: 2,
						},
					],
				})),

			dashboard: t.procedure
				.output(
					v.object({
						todaySales: v.pipe(v.number(), v.minValue(0)),
						todayOrders: v.pipe(v.number(), v.integer(), v.minValue(0)),
						pendingOrders: v.pipe(v.number(), v.integer(), v.minValue(0)),
						lowStockAlerts: v.pipe(v.number(), v.integer(), v.minValue(0)),
						newCustomers: v.pipe(v.number(), v.integer(), v.minValue(0)),
						recentOrders: v.pipe(v.array(Order), v.maxLength(10)),
						topProducts: v.pipe(v.array(Pet), v.maxLength(5)),
					}),
				)
				.query(() => ({
					todaySales: 1500,
					todayOrders: 15,
					pendingOrders: 3,
					lowStockAlerts: 5,
					newCustomers: 2,
					recentOrders: [mockOrder],
					topProducts: [mockPet],
				})),
		}),

		// Category procedures
		category: t.router({
			list: t.procedure.output(v.array(Category)).query(() => [mockCategory]),

			create: t.procedure
				.input(
					v.object({
						name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
						description: v.optional(v.pipe(v.string(), v.maxLength(500))),
						imageUrl: v.optional(Url),
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
	.mean([662.53, "us"])
	.types([112382, "instantiations"]);
