import { bench } from "@ark/attest";
import * as S from "effect/Schema";

bench("effect/petstore-api typecheck", () => {
	// Common schemas
	const Id = S.UUID;
	const Timestamp = S.DateTimeUtc;
	const Email = S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
	const Url = S.String.pipe(S.pattern(/^https?:\/\/.+/));

	const PaginationParams = S.Struct({
		page: S.optional(S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1))),
		limit: S.optional(
			S.Number.pipe(
				S.int(),
				S.greaterThanOrEqualTo(1),
				S.lessThanOrEqualTo(100),
			),
		),
		sortBy: S.optional(S.Literal("name", "createdAt", "price")),
		sortOrder: S.optional(S.Literal("asc", "desc")),
	});

	const ErrorResponse = S.Struct({
		error: S.Struct({
			code: S.String,
			message: S.String,
			details: S.optional(
				S.Array(
					S.Struct({
						field: S.String,
						message: S.String,
					}),
				),
			),
		}),
	});

	// Pet schemas
	const PetStatus = S.Literal("available", "pending", "sold");

	const Category = S.Struct({
		id: Id,
		name: S.String,
	});

	const Tag = S.Struct({
		id: Id,
		name: S.String,
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
		birthDate: S.optional(S.DateFromString),
		vaccinations: S.optional(
			S.Array(
				S.Struct({
					name: S.String,
					date: S.DateFromString,
					expiresAt: S.optional(S.DateFromString),
				}),
			),
		),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreatePetRequest = S.Struct({
		name: S.String.pipe(S.minLength(1), S.maxLength(100)),
		categoryId: Id,
		photoUrls: S.Array(Url),
		tagIds: S.Array(Id),
		status: S.optional(PetStatus),
		price: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		weight: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0.1))),
		birthDate: S.optional(S.DateFromString),
	});

	const UpdatePetRequest = S.Struct({
		name: S.optional(S.String.pipe(S.minLength(1), S.maxLength(100))),
		categoryId: S.optional(Id),
		photoUrls: S.optional(S.Array(Url)),
		tagIds: S.optional(S.Array(Id)),
		status: S.optional(PetStatus),
		price: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0))),
		weight: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0.1))),
		birthDate: S.optional(S.DateFromString),
	});

	const PaginationMeta = S.Struct({
		page: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		limit: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		total: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		totalPages: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
	});

	const PetListResponse = S.Struct({
		data: S.Array(Pet),
		pagination: PaginationMeta,
	});

	// Order schemas
	const OrderStatus = S.Literal("placed", "approved", "delivered", "cancelled");

	const ShippingAddress = S.Struct({
		street: S.String,
		city: S.String,
		state: S.String,
		zipCode: S.String.pipe(S.pattern(/^\d{5}(-\d{4})?$/)),
		country: S.Literal("US", "CA", "GB", "FR", "DE", "AU", "JP"),
	});

	const PaymentMethod = S.Union(
		S.Struct({
			type: S.Literal("credit_card"),
			last4: S.String.pipe(S.length(4)),
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
		}),
		S.Struct({
			type: S.Literal("bank_transfer"),
			accountNumber: S.String,
			routingNumber: S.String,
		}),
	);

	const Order = S.Struct({
		id: Id,
		petId: Id,
		customerId: Id,
		quantity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		status: OrderStatus,
		shippingAddress: ShippingAddress,
		paymentMethod: PaymentMethod,
		subtotal: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		tax: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		shipping: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		total: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		shipDate: S.optional(Timestamp),
		deliveredAt: S.optional(Timestamp),
		cancelledAt: S.optional(Timestamp),
		cancellationReason: S.optional(S.String),
	});

	const CreateOrderPaymentMethod = S.Union(
		S.Struct({
			type: S.Literal("credit_card"),
			cardNumber: S.String.pipe(S.pattern(/^\d{16}$/)),
			cvv: S.String.pipe(S.pattern(/^\d{3,4}$/)),
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
		}),
		S.Struct({
			type: S.Literal("bank_transfer"),
			accountNumber: S.String,
			routingNumber: S.String,
		}),
	);

	const CreateOrderRequest = S.Struct({
		petId: Id,
		quantity: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
		shippingAddress: ShippingAddress,
		paymentMethod: CreateOrderPaymentMethod,
	});

	// Customer schemas
	const CustomerAddress = S.Struct({
		id: Id,
		type: S.Literal("home", "work", "other"),
		street: S.String,
		city: S.String,
		state: S.String,
		zipCode: S.String.pipe(S.pattern(/^\d{5}(-\d{4})?$/)),
		country: S.Literal("US", "CA", "GB", "FR", "DE", "AU", "JP"),
		isDefault: S.Boolean,
	});

	const Customer = S.Struct({
		id: Id,
		email: Email,
		firstName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		lastName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
		addresses: S.Array(CustomerAddress),
		preferences: S.Struct({
			newsletter: S.Boolean,
			smsNotifications: S.Boolean,
			favoriteCategories: S.Array(Id),
		}),
		loyaltyPoints: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		lastLoginAt: S.optional(Timestamp),
	});

	const RegisterCustomerRequest = S.Struct({
		email: Email,
		password: S.String.pipe(S.minLength(8), S.maxLength(100)),
		firstName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		lastName: S.String.pipe(S.minLength(1), S.maxLength(50)),
		phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
	});

	// Review schemas
	const Review = S.Struct({
		id: Id,
		petId: Id,
		customerId: Id,
		rating: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(1),
			S.lessThanOrEqualTo(5),
		),
		title: S.String.pipe(S.minLength(1), S.maxLength(200)),
		comment: S.String.pipe(S.minLength(1), S.maxLength(2000)),
		images: S.optional(S.Array(Url)),
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

	const CreateReviewRequest = S.Struct({
		petId: Id,
		rating: S.Number.pipe(
			S.int(),
			S.greaterThanOrEqualTo(1),
			S.lessThanOrEqualTo(5),
		),
		title: S.String.pipe(S.minLength(1), S.maxLength(200)),
		comment: S.String.pipe(S.minLength(1), S.maxLength(2000)),
		images: S.optional(S.Array(Url)),
	});

	// Inventory schemas
	const InventoryItem = S.Struct({
		petId: Id,
		quantityAvailable: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		quantityReserved: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		reorderLevel: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
		warehouse: S.Struct({
			id: Id,
			name: S.String,
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
		}),
		lastRestocked: S.optional(Timestamp),
		nextRestockDate: S.optional(Timestamp),
	});

	// Analytics schemas
	const AnalyticsReport = S.Struct({
		period: S.Struct({
			start: Timestamp,
			end: Timestamp,
		}),
		sales: S.Struct({
			totalRevenue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
			totalOrders: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			averageOrderValue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
			topSellingPets: S.Array(
				S.Struct({
					petId: Id,
					name: S.String,
					unitsSold: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
					revenue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
				}),
			),
		}),
		customers: S.Struct({
			newCustomers: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			returningCustomers: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			churnRate: S.Number.pipe(
				S.greaterThanOrEqualTo(0),
				S.lessThanOrEqualTo(100),
			),
		}),
		inventory: S.Struct({
			lowStockItems: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			outOfStockItems: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
			totalValue: S.Number.pipe(S.greaterThanOrEqualTo(0)),
		}),
	});

	// API Endpoint definitions (type-safe RPC-like)
	const API = S.Struct({
		"GET /pets": S.Struct({
			query: PaginationParams,
			response: S.Union(PetListResponse, ErrorResponse),
		}),
		"GET /pets/:id": S.Struct({
			params: S.Struct({ id: Id }),
			response: S.Union(Pet, ErrorResponse),
		}),
		"POST /pets": S.Struct({
			body: CreatePetRequest,
			response: S.Union(Pet, ErrorResponse),
		}),
		"PUT /pets/:id": S.Struct({
			params: S.Struct({ id: Id }),
			body: UpdatePetRequest,
			response: S.Union(Pet, ErrorResponse),
		}),
		"DELETE /pets/:id": S.Struct({
			params: S.Struct({ id: Id }),
			response: S.Union(S.Struct({ success: S.Boolean }), ErrorResponse),
		}),

		// Order endpoints
		"GET /orders": S.Struct({
			query: PaginationParams,
			response: S.Union(
				S.Struct({
					data: S.Array(Order),
					pagination: PaginationMeta,
				}),
				ErrorResponse,
			),
		}),
		"GET /orders/:id": S.Struct({
			params: S.Struct({ id: Id }),
			response: S.Union(Order, ErrorResponse),
		}),
		"POST /orders": S.Struct({
			body: CreateOrderRequest,
			response: S.Union(Order, ErrorResponse),
		}),
		"PATCH /orders/:id/status": S.Struct({
			params: S.Struct({ id: Id }),
			body: S.Struct({
				status: OrderStatus,
				cancellationReason: S.optional(S.String),
			}),
			response: S.Union(Order, ErrorResponse),
		}),

		// Customer endpoints
		"POST /customers/register": S.Struct({
			body: RegisterCustomerRequest,
			response: S.Union(Customer, ErrorResponse),
		}),
		"GET /customers/me": S.Struct({
			response: S.Union(Customer, ErrorResponse),
		}),
		"PUT /customers/me": S.Struct({
			body: S.Struct({
				firstName: S.optional(S.String.pipe(S.minLength(1), S.maxLength(50))),
				lastName: S.optional(S.String.pipe(S.minLength(1), S.maxLength(50))),
				phone: S.optional(S.String.pipe(S.pattern(/^\+?[\d\s-()]+$/))),
				preferences: S.optional(
					S.Struct({
						newsletter: S.Boolean,
						smsNotifications: S.Boolean,
						favoriteCategories: S.Array(Id),
					}),
				),
			}),
			response: S.Union(Customer, ErrorResponse),
		}),

		// Review endpoints
		"GET /pets/:petId/reviews": S.Struct({
			params: S.Struct({ petId: Id }),
			query: PaginationParams,
			response: S.Union(
				S.Struct({
					data: S.Array(Review),
					pagination: PaginationMeta,
					averageRating: S.Number.pipe(
						S.greaterThanOrEqualTo(0),
						S.lessThanOrEqualTo(5),
					),
				}),
				ErrorResponse,
			),
		}),
		"POST /reviews": S.Struct({
			body: CreateReviewRequest,
			response: S.Union(Review, ErrorResponse),
		}),

		// Inventory endpoints
		"GET /inventory": S.Struct({
			query: S.Struct({
				warehouseId: S.optional(Id),
				lowStock: S.optional(S.Boolean),
			}),
			response: S.Union(
				S.Struct({
					data: S.Array(InventoryItem),
				}),
				ErrorResponse,
			),
		}),

		// Analytics endpoints
		"GET /analytics/sales": S.Struct({
			query: S.Struct({
				startDate: Timestamp,
				endDate: Timestamp,
				groupBy: S.optional(S.Literal("day", "week", "month")),
			}),
			response: S.Union(AnalyticsReport, ErrorResponse),
		}),
	});

	type APIT = S.Schema.Type<typeof API>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type APITR = DeepReadonly<APIT>;

	return {} as APITR;
})
	.mean([1.67, "ms"])
	.types([61999, "instantiations"]);
