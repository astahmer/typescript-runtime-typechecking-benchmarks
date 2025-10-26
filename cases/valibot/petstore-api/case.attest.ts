import { bench } from "@ark/attest";
import type { InferOutput } from "valibot";
import * as v from "valibot";

bench("valibot/petstore-api typecheck", () => {
	// Common schemas
	const Id = v.pipe(v.string(), v.uuid());
	const Timestamp = v.pipe(v.string(), v.isoDateTime());
	const Email = v.pipe(v.string(), v.email());
	const Url = v.pipe(v.string(), v.url());

	const PaginationParams = v.object({
		page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
		limit: v.optional(
			v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
			20,
		),
		sortBy: v.optional(v.picklist(["name", "createdAt", "price"])),
		sortOrder: v.optional(v.picklist(["asc", "desc"]), "asc"),
	});

	const ErrorResponse = v.object({
		error: v.object({
			code: v.string(),
			message: v.string(),
			details: v.optional(
				v.array(
					v.object({
						field: v.string(),
						message: v.string(),
					}),
				),
			),
		}),
	});

	// Pet schemas
	const PetStatus = v.picklist(["available", "pending", "sold"]);

	const Category = v.object({
		id: Id,
		name: v.string(),
	});

	const Tag = v.object({
		id: Id,
		name: v.string(),
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
		birthDate: v.optional(v.pipe(v.string(), v.isoDate())),
		vaccinations: v.optional(
			v.array(
				v.object({
					name: v.string(),
					date: v.pipe(v.string(), v.isoDate()),
					expiresAt: v.optional(v.pipe(v.string(), v.isoDate())),
				}),
			),
		),
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreatePetRequest = v.object({
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
		categoryId: Id,
		photoUrls: v.array(Url),
		tagIds: v.array(Id),
		status: v.optional(PetStatus, "available"),
		price: v.pipe(v.number(), v.minValue(0)),
		weight: v.optional(v.pipe(v.number(), v.minValue(0.1))),
		birthDate: v.optional(v.pipe(v.string(), v.isoDate())),
	});

	const UpdatePetRequest = v.object({
		name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
		categoryId: v.optional(Id),
		photoUrls: v.optional(v.array(Url)),
		tagIds: v.optional(v.array(Id)),
		status: v.optional(PetStatus),
		price: v.optional(v.pipe(v.number(), v.minValue(0))),
		weight: v.optional(v.pipe(v.number(), v.minValue(0.1))),
		birthDate: v.optional(v.pipe(v.string(), v.isoDate())),
	});

	const PetListResponse = v.object({
		data: v.array(Pet),
		pagination: v.object({
			page: v.pipe(v.number(), v.integer(), v.minValue(1)),
			limit: v.pipe(v.number(), v.integer(), v.minValue(1)),
			total: v.pipe(v.number(), v.integer(), v.minValue(0)),
			totalPages: v.pipe(v.number(), v.integer(), v.minValue(0)),
		}),
	});

	// Order schemas
	const OrderStatus = v.picklist([
		"placed",
		"approved",
		"delivered",
		"cancelled",
	]);

	const Order = v.object({
		id: Id,
		petId: Id,
		customerId: Id,
		quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
		status: OrderStatus,
		shippingAddress: v.object({
			street: v.string(),
			city: v.string(),
			state: v.string(),
			zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
			country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
		}),
		paymentMethod: v.union([
			v.object({
				type: v.literal("credit_card"),
				last4: v.pipe(v.string(), v.length(4)),
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
			}),
			v.object({
				type: v.literal("bank_transfer"),
				accountNumber: v.string(),
				routingNumber: v.string(),
			}),
		]),
		subtotal: v.pipe(v.number(), v.minValue(0)),
		tax: v.pipe(v.number(), v.minValue(0)),
		shipping: v.pipe(v.number(), v.minValue(0)),
		total: v.pipe(v.number(), v.minValue(0)),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		shipDate: v.optional(Timestamp),
		deliveredAt: v.optional(Timestamp),
		cancelledAt: v.optional(Timestamp),
		cancellationReason: v.optional(v.string()),
	});

	const CreateOrderRequest = v.object({
		petId: Id,
		quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
		shippingAddress: v.object({
			street: v.string(),
			city: v.string(),
			state: v.string(),
			zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
			country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
		}),
		paymentMethod: v.union([
			v.object({
				type: v.literal("credit_card"),
				cardNumber: v.pipe(v.string(), v.regex(/^\d{16}$/)),
				cvv: v.pipe(v.string(), v.regex(/^\d{3,4}$/)),
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
			}),
			v.object({
				type: v.literal("bank_transfer"),
				accountNumber: v.string(),
				routingNumber: v.string(),
			}),
		]),
	});

	// Customer schemas
	const Customer = v.object({
		id: Id,
		email: Email,
		firstName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		lastName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
		addresses: v.array(
			v.object({
				id: Id,
				type: v.picklist(["home", "work", "other"]),
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
				country: v.picklist(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
				isDefault: v.boolean(),
			}),
		),
		preferences: v.object({
			newsletter: v.boolean(),
			smsNotifications: v.boolean(),
			favoriteCategories: v.array(Id),
		}),
		loyaltyPoints: v.pipe(v.number(), v.integer(), v.minValue(0)),
		createdAt: Timestamp,
		updatedAt: Timestamp,
		lastLoginAt: v.optional(Timestamp),
	});

	const RegisterCustomerRequest = v.object({
		email: Email,
		password: v.pipe(v.string(), v.minLength(8), v.maxLength(100)),
		firstName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		lastName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
	});

	// Review schemas
	const Review = v.object({
		id: Id,
		petId: Id,
		customerId: Id,
		rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
		title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
		comment: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
		images: v.optional(v.array(Url)),
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

	const CreateReviewRequest = v.object({
		petId: Id,
		rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
		title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
		comment: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
		images: v.optional(v.array(Url)),
	});

	// Inventory schemas
	const InventoryItem = v.object({
		petId: Id,
		quantityAvailable: v.pipe(v.number(), v.integer(), v.minValue(0)),
		quantityReserved: v.pipe(v.number(), v.integer(), v.minValue(0)),
		reorderLevel: v.pipe(v.number(), v.integer(), v.minValue(0)),
		warehouse: v.object({
			id: Id,
			name: v.string(),
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
		}),
		lastRestocked: v.optional(Timestamp),
		nextRestockDate: v.optional(Timestamp),
	});

	// Analytics schemas
	const AnalyticsReport = v.object({
		period: v.object({
			start: Timestamp,
			end: Timestamp,
		}),
		sales: v.object({
			totalRevenue: v.pipe(v.number(), v.minValue(0)),
			totalOrders: v.pipe(v.number(), v.integer(), v.minValue(0)),
			averageOrderValue: v.pipe(v.number(), v.minValue(0)),
			topSellingPets: v.array(
				v.object({
					petId: Id,
					name: v.string(),
					unitsSold: v.pipe(v.number(), v.integer(), v.minValue(0)),
					revenue: v.pipe(v.number(), v.minValue(0)),
				}),
			),
		}),
		customers: v.object({
			newCustomers: v.pipe(v.number(), v.integer(), v.minValue(0)),
			returningCustomers: v.pipe(v.number(), v.integer(), v.minValue(0)),
			churnRate: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
		}),
		inventory: v.object({
			lowStockItems: v.pipe(v.number(), v.integer(), v.minValue(0)),
			outOfStockItems: v.pipe(v.number(), v.integer(), v.minValue(0)),
			totalValue: v.pipe(v.number(), v.minValue(0)),
		}),
	});

	// API Endpoint definitions (type-safe RPC-like)
	const API = v.object({
		// Pet endpoints
		"GET /pets": v.object({
			query: PaginationParams,
			response: v.union([PetListResponse, ErrorResponse]),
		}),
		"GET /pets/:id": v.object({
			params: v.object({ id: Id }),
			response: v.union([Pet, ErrorResponse]),
		}),
		"POST /pets": v.object({
			body: CreatePetRequest,
			response: v.union([Pet, ErrorResponse]),
		}),
		"PUT /pets/:id": v.object({
			params: v.object({ id: Id }),
			body: UpdatePetRequest,
			response: v.union([Pet, ErrorResponse]),
		}),
		"DELETE /pets/:id": v.object({
			params: v.object({ id: Id }),
			response: v.union([v.object({ success: v.boolean() }), ErrorResponse]),
		}),

		// Order endpoints
		"GET /orders": v.object({
			query: PaginationParams,
			response: v.union([
				v.object({
					data: v.array(Order),
					pagination: v.object({
						page: v.pipe(v.number(), v.integer(), v.minValue(1)),
						limit: v.pipe(v.number(), v.integer(), v.minValue(1)),
						total: v.pipe(v.number(), v.integer(), v.minValue(0)),
						totalPages: v.pipe(v.number(), v.integer(), v.minValue(0)),
					}),
				}),
				ErrorResponse,
			]),
		}),
		"GET /orders/:id": v.object({
			params: v.object({ id: Id }),
			response: v.union([Order, ErrorResponse]),
		}),
		"POST /orders": v.object({
			body: CreateOrderRequest,
			response: v.union([Order, ErrorResponse]),
		}),
		"PATCH /orders/:id/status": v.object({
			params: v.object({ id: Id }),
			body: v.object({
				status: OrderStatus,
				cancellationReason: v.optional(v.string()),
			}),
			response: v.union([Order, ErrorResponse]),
		}),

		// Customer endpoints
		"POST /customers/register": v.object({
			body: RegisterCustomerRequest,
			response: v.union([Customer, ErrorResponse]),
		}),
		"GET /customers/me": v.object({
			response: v.union([Customer, ErrorResponse]),
		}),
		"PUT /customers/me": v.object({
			body: v.object({
				firstName: v.optional(
					v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
				),
				lastName: v.optional(
					v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
				),
				phone: v.optional(v.pipe(v.string(), v.regex(/^\+?[\d\s-()]+$/))),
				preferences: v.optional(
					v.object({
						newsletter: v.boolean(),
						smsNotifications: v.boolean(),
						favoriteCategories: v.array(Id),
					}),
				),
			}),
			response: v.union([Customer, ErrorResponse]),
		}),

		// Review endpoints
		"GET /pets/:petId/reviews": v.object({
			params: v.object({ petId: Id }),
			query: PaginationParams,
			response: v.union([
				v.object({
					data: v.array(Review),
					pagination: v.object({
						page: v.pipe(v.number(), v.integer(), v.minValue(1)),
						limit: v.pipe(v.number(), v.integer(), v.minValue(1)),
						total: v.pipe(v.number(), v.integer(), v.minValue(0)),
						totalPages: v.pipe(v.number(), v.integer(), v.minValue(0)),
					}),
					averageRating: v.pipe(v.number(), v.minValue(0), v.maxValue(5)),
				}),
				ErrorResponse,
			]),
		}),
		"POST /reviews": v.object({
			body: CreateReviewRequest,
			response: v.union([Review, ErrorResponse]),
		}),

		// Inventory endpoints
		"GET /inventory": v.object({
			query: v.object({
				warehouseId: v.optional(Id),
				lowStock: v.optional(v.boolean()),
			}),
			response: v.union([
				v.object({
					data: v.array(InventoryItem),
				}),
				ErrorResponse,
			]),
		}),

		// Analytics endpoints
		"GET /analytics/sales": v.object({
			query: v.object({
				startDate: Timestamp,
				endDate: Timestamp,
				groupBy: v.optional(v.picklist(["day", "week", "month"])),
			}),
			response: v.union([AnalyticsReport, ErrorResponse]),
		}),
	});

	type APIT = InferOutput<typeof API>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type APITR = DeepReadonly<APIT>;

	return {} as APITR;
})
	.mean([204.56, "us"])
	.types([76158, "instantiations"]);
