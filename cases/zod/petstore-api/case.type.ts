import { z } from "zod";

// Common schemas
const Id = z.string().uuid();
const Timestamp = z.string().datetime();
const Email = z.string().email();
const Url = z.string().url();

const PaginationParams = z.object({
	page: z.number().int().min(1).optional().default(1),
	limit: z.number().int().min(1).max(100).optional().default(20),
	sortBy: z.enum(["name", "createdAt", "price"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

const ErrorResponse = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z
			.array(
				z.object({
					field: z.string(),
					message: z.string(),
				}),
			)
			.optional(),
	}),
});

// Pet schemas
const PetStatus = z.enum(["available", "pending", "sold"]);

const Category = z.object({
	id: Id,
	name: z.string(),
});

const Tag = z.object({
	id: Id,
	name: z.string(),
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
	birthDate: z.string().date().optional(),
	vaccinations: z
		.array(
			z.object({
				name: z.string(),
				date: z.string().date(),
				expiresAt: z.string().date().optional(),
			}),
		)
		.optional(),
	createdAt: Timestamp,
	updatedAt: Timestamp,
});

const CreatePetRequest = z.object({
	name: z.string().min(1).max(100),
	categoryId: Id,
	photoUrls: z.array(Url),
	tagIds: z.array(Id),
	status: PetStatus.optional().default("available"),
	price: z.number().min(0),
	weight: z.number().min(0.1).optional(),
	birthDate: z.string().date().optional(),
});

const UpdatePetRequest = z.object({
	name: z.string().min(1).max(100).optional(),
	categoryId: Id.optional(),
	photoUrls: z.array(Url).optional(),
	tagIds: z.array(Id).optional(),
	status: PetStatus.optional(),
	price: z.number().min(0).optional(),
	weight: z.number().min(0.1).optional(),
	birthDate: z.string().date().optional(),
});

const PetListResponse = z.object({
	data: z.array(Pet),
	pagination: z.object({
		page: z.number().int().min(1),
		limit: z.number().int().min(1),
		total: z.number().int().min(0),
		totalPages: z.number().int().min(0),
	}),
});

// Order schemas
const OrderStatus = z.enum(["placed", "approved", "delivered", "cancelled"]);

const Order = z.object({
	id: Id,
	petId: Id,
	customerId: Id,
	quantity: z.number().int().min(1),
	status: OrderStatus,
	shippingAddress: z.object({
		street: z.string(),
		city: z.string(),
		state: z.string(),
		zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
		country: z.enum(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
	}),
	paymentMethod: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("credit_card"),
			last4: z.string().length(4),
			expiryMonth: z.number().int().min(1).max(12),
			expiryYear: z.number().int().min(2024),
		}),
		z.object({
			type: z.literal("paypal"),
			email: Email,
		}),
		z.object({
			type: z.literal("bank_transfer"),
			accountNumber: z.string(),
			routingNumber: z.string(),
		}),
	]),
	subtotal: z.number().min(0),
	tax: z.number().min(0),
	shipping: z.number().min(0),
	total: z.number().min(0),
	createdAt: Timestamp,
	updatedAt: Timestamp,
	shipDate: Timestamp.optional(),
	deliveredAt: Timestamp.optional(),
	cancelledAt: Timestamp.optional(),
	cancellationReason: z.string().optional(),
});

const CreateOrderRequest = z.object({
	petId: Id,
	quantity: z.number().int().min(1),
	shippingAddress: z.object({
		street: z.string(),
		city: z.string(),
		state: z.string(),
		zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
		country: z.enum(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
	}),
	paymentMethod: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("credit_card"),
			cardNumber: z.string().regex(/^\d{16}$/),
			cvv: z.string().regex(/^\d{3,4}$/),
			expiryMonth: z.number().int().min(1).max(12),
			expiryYear: z.number().int().min(2024),
		}),
		z.object({
			type: z.literal("paypal"),
			email: Email,
		}),
		z.object({
			type: z.literal("bank_transfer"),
			accountNumber: z.string(),
			routingNumber: z.string(),
		}),
	]),
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
	addresses: z.array(
		z.object({
			id: Id,
			type: z.enum(["home", "work", "other"]),
			street: z.string(),
			city: z.string(),
			state: z.string(),
			zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
			country: z.enum(["US", "CA", "GB", "FR", "DE", "AU", "JP"]),
			isDefault: z.boolean(),
		}),
	),
	preferences: z.object({
		newsletter: z.boolean(),
		smsNotifications: z.boolean(),
		favoriteCategories: z.array(Id),
	}),
	loyaltyPoints: z.number().int().min(0),
	createdAt: Timestamp,
	updatedAt: Timestamp,
	lastLoginAt: Timestamp.optional(),
});

const RegisterCustomerRequest = z.object({
	email: Email,
	password: z.string().min(8).max(100),
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	phone: z
		.string()
		.regex(/^\+?[\d\s-()]+$/)
		.optional(),
});

// Review schemas
const Review = z.object({
	id: Id,
	petId: Id,
	customerId: Id,
	rating: z.number().int().min(1).max(5),
	title: z.string().min(1).max(200),
	comment: z.string().min(1).max(2000),
	images: z.array(Url).optional(),
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

const CreateReviewRequest = z.object({
	petId: Id,
	rating: z.number().int().min(1).max(5),
	title: z.string().min(1).max(200),
	comment: z.string().min(1).max(2000),
	images: z.array(Url).optional(),
});

// Inventory schemas
const InventoryItem = z.object({
	petId: Id,
	quantityAvailable: z.number().int().min(0),
	quantityReserved: z.number().int().min(0),
	reorderLevel: z.number().int().min(0),
	warehouse: z.object({
		id: Id,
		name: z.string(),
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
	}),
	lastRestocked: Timestamp.optional(),
	nextRestockDate: Timestamp.optional(),
});

// Analytics schemas
const AnalyticsReport = z.object({
	period: z.object({
		start: Timestamp,
		end: Timestamp,
	}),
	sales: z.object({
		totalRevenue: z.number().min(0),
		totalOrders: z.number().int().min(0),
		averageOrderValue: z.number().min(0),
		topSellingPets: z.array(
			z.object({
				petId: Id,
				name: z.string(),
				unitsSold: z.number().int().min(0),
				revenue: z.number().min(0),
			}),
		),
	}),
	customers: z.object({
		newCustomers: z.number().int().min(0),
		returningCustomers: z.number().int().min(0),
		churnRate: z.number().min(0).max(100),
	}),
	inventory: z.object({
		lowStockItems: z.number().int().min(0),
		outOfStockItems: z.number().int().min(0),
		totalValue: z.number().min(0),
	}),
});

// API Endpoint definitions (type-safe RPC-like)
const API = z.object({
	// Pet endpoints
	"GET /pets": z.object({
		query: PaginationParams,
		response: z.union([PetListResponse, ErrorResponse]),
	}),
	"GET /pets/:id": z.object({
		params: z.object({ id: Id }),
		response: z.union([Pet, ErrorResponse]),
	}),
	"POST /pets": z.object({
		body: CreatePetRequest,
		response: z.union([Pet, ErrorResponse]),
	}),
	"PUT /pets/:id": z.object({
		params: z.object({ id: Id }),
		body: UpdatePetRequest,
		response: z.union([Pet, ErrorResponse]),
	}),
	"DELETE /pets/:id": z.object({
		params: z.object({ id: Id }),
		response: z.union([z.object({ success: z.boolean() }), ErrorResponse]),
	}),

	// Order endpoints
	"GET /orders": z.object({
		query: PaginationParams,
		response: z.union([
			z.object({
				data: z.array(Order),
				pagination: z.object({
					page: z.number().int().min(1),
					limit: z.number().int().min(1),
					total: z.number().int().min(0),
					totalPages: z.number().int().min(0),
				}),
			}),
			ErrorResponse,
		]),
	}),
	"GET /orders/:id": z.object({
		params: z.object({ id: Id }),
		response: z.union([Order, ErrorResponse]),
	}),
	"POST /orders": z.object({
		body: CreateOrderRequest,
		response: z.union([Order, ErrorResponse]),
	}),
	"PATCH /orders/:id/status": z.object({
		params: z.object({ id: Id }),
		body: z.object({
			status: OrderStatus,
			cancellationReason: z.string().optional(),
		}),
		response: z.union([Order, ErrorResponse]),
	}),

	// Customer endpoints
	"POST /customers/register": z.object({
		body: RegisterCustomerRequest,
		response: z.union([Customer, ErrorResponse]),
	}),
	"GET /customers/me": z.object({
		response: z.union([Customer, ErrorResponse]),
	}),
	"PUT /customers/me": z.object({
		body: z.object({
			firstName: z.string().min(1).max(50).optional(),
			lastName: z.string().min(1).max(50).optional(),
			phone: z
				.string()
				.regex(/^\+?[\d\s-()]+$/)
				.optional(),
			preferences: z
				.object({
					newsletter: z.boolean(),
					smsNotifications: z.boolean(),
					favoriteCategories: z.array(Id),
				})
				.optional(),
		}),
		response: z.union([Customer, ErrorResponse]),
	}),

	// Review endpoints
	"GET /pets/:petId/reviews": z.object({
		params: z.object({ petId: Id }),
		query: PaginationParams,
		response: z.union([
			z.object({
				data: z.array(Review),
				pagination: z.object({
					page: z.number().int().min(1),
					limit: z.number().int().min(1),
					total: z.number().int().min(0),
					totalPages: z.number().int().min(0),
				}),
				averageRating: z.number().min(0).max(5),
			}),
			ErrorResponse,
		]),
	}),
	"POST /reviews": z.object({
		body: CreateReviewRequest,
		response: z.union([Review, ErrorResponse]),
	}),

	// Inventory endpoints
	"GET /inventory": z.object({
		query: z.object({
			warehouseId: Id.optional(),
			lowStock: z.boolean().optional(),
		}),
		response: z.union([
			z.object({
				data: z.array(InventoryItem),
			}),
			ErrorResponse,
		]),
	}),

	// Analytics endpoints
	"GET /analytics/sales": z.object({
		query: z.object({
			startDate: Timestamp,
			endDate: Timestamp,
			groupBy: z.enum(["day", "week", "month"]).optional(),
		}),
		response: z.union([AnalyticsReport, ErrorResponse]),
	}),
});

type T = z.infer<typeof API>;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
