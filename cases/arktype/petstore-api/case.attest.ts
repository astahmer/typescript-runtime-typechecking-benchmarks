import { bench } from "@ark/attest";
import { type } from "arktype";

bench("arktype/petstore-api typecheck", () => {
	// Common schemas
	const Id = type("string.uuid");
	const Timestamp = type("string.date.iso");
	const Email = type("string.email");
	const Url = type(/^https?:\/\/.+/);

	const PaginationParams = type({
		"page?": "number.integer>=1",
		"limit?": "1<=number.integer<=100",
		"sortBy?": "'name'|'createdAt'|'price'",
		"sortOrder?": "'asc'|'desc'",
	});

	const ErrorResponse = type({
		error: {
			code: "string",
			message: "string",
			"details?": [
				{
					field: "string",
					message: "string",
				},
				"[]",
			],
		},
	});

	// Pet schemas
	const PetStatus = type("'available'|'pending'|'sold'");

	const Category = type({
		id: Id,
		name: "string",
	});

	const Tag = type({
		id: Id,
		name: "string",
	});

	const Pet = type({
		id: Id,
		name: "1<=string<=100",
		category: Category,
		photoUrls: [Url, "[]"],
		tags: [Tag, "[]"],
		status: PetStatus,
		price: "number>=0",
		"weight?": "number>=0.1",
		"birthDate?": "string.date.iso",
		"vaccinations?": [
			{
				name: "string",
				date: "string.date.iso",
				"expiresAt?": "string.date.iso",
			},
			"[]",
		],
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreatePetRequest = type({
		name: "1<=string<=100",
		categoryId: Id,
		photoUrls: [Url, "[]"],
		tagIds: [Id, "[]"],
		"status?": PetStatus,
		price: "number>=0",
		"weight?": "number>=0.1",
		"birthDate?": "string.date.iso",
	});

	const UpdatePetRequest = type({
		"name?": "1<=string<=100",
		"categoryId?": Id,
		"photoUrls?": [Url, "[]"],
		"tagIds?": [Id, "[]"],
		"status?": PetStatus,
		"price?": "number>=0",
		"weight?": "number>=0.1",
		"birthDate?": "string.date.iso",
	});

	const PaginationMeta = type({
		page: "number.integer>=1",
		limit: "number.integer>=1",
		total: "number.integer>=0",
		totalPages: "number.integer>=0",
	});

	const PetListResponse = type({
		data: [Pet, "[]"],
		pagination: PaginationMeta,
	});

	// Order schemas
	const OrderStatus = type("'placed'|'approved'|'delivered'|'cancelled'");

	const ShippingAddress = type({
		street: "string",
		city: "string",
		state: "string",
		zipCode: /^\d{5}(-\d{4})?$/,
		country: "'US'|'CA'|'GB'|'FR'|'DE'|'AU'|'JP'",
	});

	const PaymentMethod = type({
		type: "'credit_card'|'paypal'|'bank_transfer'",
		"last4?": "string==4",
		"expiryMonth?": "1<=number.integer<=12",
		"expiryYear?": "number.integer>=2024",
		"email?": Email,
		"accountNumber?": "string",
		"routingNumber?": "string",
	});

	const Order = type({
		id: Id,
		petId: Id,
		customerId: Id,
		quantity: "number.integer>=1",
		status: OrderStatus,
		shippingAddress: ShippingAddress,
		paymentMethod: PaymentMethod,
		subtotal: "number>=0",
		tax: "number>=0",
		shipping: "number>=0",
		total: "number>=0",
		createdAt: Timestamp,
		updatedAt: Timestamp,
		"shipDate?": Timestamp,
		"deliveredAt?": Timestamp,
		"cancelledAt?": Timestamp,
		"cancellationReason?": "string",
	});

	const CreateOrderPaymentMethod = type({
		type: "'credit_card'|'paypal'|'bank_transfer'",
		"cardNumber?": /^\d{16}$/,
		"cvv?": /^\d{3,4}$/,
		"expiryMonth?": "1<=number.integer<=12",
		"expiryYear?": "number.integer>=2024",
		"email?": Email,
		"accountNumber?": "string",
		"routingNumber?": "string",
	});

	const CreateOrderRequest = type({
		petId: Id,
		quantity: "number.integer>=1",
		shippingAddress: ShippingAddress,
		paymentMethod: CreateOrderPaymentMethod,
	});

	// Customer schemas
	const CustomerAddress = type({
		id: Id,
		type: "'home'|'work'|'other'",
		street: "string",
		city: "string",
		state: "string",
		zipCode: /^\d{5}(-\d{4})?$/,
		country: "'US'|'CA'|'GB'|'FR'|'DE'|'AU'|'JP'",
		isDefault: "boolean",
	});

	const Customer = type({
		id: Id,
		email: Email,
		firstName: "1<=string<=50",
		lastName: "1<=string<=50",
		"phone?": /^\+?[\d\s-()]+$/,
		addresses: [CustomerAddress, "[]"],
		preferences: {
			newsletter: "boolean",
			smsNotifications: "boolean",
			favoriteCategories: [Id, "[]"],
		},
		loyaltyPoints: "number.integer>=0",
		createdAt: Timestamp,
		updatedAt: Timestamp,
		"lastLoginAt?": Timestamp,
	});

	const RegisterCustomerRequest = type({
		email: Email,
		password: "8<=string<=100",
		firstName: "1<=string<=50",
		lastName: "1<=string<=50",
		"phone?": /^\+?[\d\s-()]+$/,
	});

	// Review schemas
	const Review = type({
		id: Id,
		petId: Id,
		customerId: Id,
		rating: "1<=number.integer<=5",
		title: "1<=string<=200",
		comment: "1<=string<=2000",
		"images?": [Url, "[]"],
		helpful: "number.integer>=0",
		notHelpful: "number.integer>=0",
		verified: "boolean",
		"response?": {
			text: "string",
			respondedAt: Timestamp,
			respondedBy: "string",
		},
		createdAt: Timestamp,
		updatedAt: Timestamp,
	});

	const CreateReviewRequest = type({
		petId: Id,
		rating: "1<=number.integer<=5",
		title: "1<=string<=200",
		comment: "1<=string<=2000",
		"images?": [Url, "[]"],
	});

	// Inventory schemas
	const InventoryItem = type({
		petId: Id,
		quantityAvailable: "number.integer>=0",
		quantityReserved: "number.integer>=0",
		reorderLevel: "number.integer>=0",
		warehouse: {
			id: Id,
			name: "string",
			location: {
				address: "string",
				city: "string",
				state: "string",
				country: "string",
				"coordinates?": {
					lat: "-90<=number<=90",
					lng: "-180<=number<=180",
				},
			},
		},
		"lastRestocked?": Timestamp,
		"nextRestockDate?": Timestamp,
	});

	// Analytics schemas
	const AnalyticsReport = type({
		period: {
			start: Timestamp,
			end: Timestamp,
		},
		sales: {
			totalRevenue: "number>=0",
			totalOrders: "number.integer>=0",
			averageOrderValue: "number>=0",
			topSellingPets: [
				{
					petId: Id,
					name: "string",
					unitsSold: "number.integer>=0",
					revenue: "number>=0",
				},
				"[]",
			],
		},
		customers: {
			newCustomers: "number.integer>=0",
			returningCustomers: "number.integer>=0",
			churnRate: "0<=number<=100",
		},
		inventory: {
			lowStockItems: "number.integer>=0",
			outOfStockItems: "number.integer>=0",
			totalValue: "number>=0",
		},
	});

	// API Endpoint definitions (type-safe RPC-like)
	const API = type({
		"GET /pets": {
			query: PaginationParams,
			response: type([PetListResponse, "|", ErrorResponse]),
		},
		"GET /pets/:id": {
			params: type({ id: Id }),
			response: type([Pet, "|", ErrorResponse]),
		},
		"POST /pets": {
			body: CreatePetRequest,
			response: type([Pet, "|", ErrorResponse]),
		},
		"PUT /pets/:id": {
			params: type({ id: Id }),
			body: UpdatePetRequest,
			response: type([Pet, "|", ErrorResponse]),
		},
		"DELETE /pets/:id": {
			params: type({ id: Id }),
			response: type([type({ success: "boolean" }), "|", ErrorResponse]),
		},

		// Order endpoints
		"GET /orders": {
			query: PaginationParams,
			response: type([
				type({
					data: [Order, "[]"],
					pagination: PaginationMeta,
				}),
				"|",
				ErrorResponse,
			]),
		},
		"GET /orders/:id": {
			params: type({ id: Id }),
			response: type([Order, "|", ErrorResponse]),
		},
		"POST /orders": {
			body: CreateOrderRequest,
			response: type([Order, "|", ErrorResponse]),
		},
		"PATCH /orders/:id/status": {
			params: type({ id: Id }),
			body: type({
				status: OrderStatus,
				"cancellationReason?": "string",
			}),
			response: type([Order, "|", ErrorResponse]),
		},

		// Customer endpoints
		"POST /customers/register": {
			body: RegisterCustomerRequest,
			response: type([Customer, "|", ErrorResponse]),
		},
		"GET /customers/me": {
			response: type([Customer, "|", ErrorResponse]),
		},
		"PUT /customers/me": {
			body: type({
				"firstName?": "1<=string<=50",
				"lastName?": "1<=string<=50",
				"phone?": /^\+?[\d\s-()]+$/,
				"preferences?": {
					newsletter: "boolean",
					smsNotifications: "boolean",
					favoriteCategories: [Id, "[]"],
				},
			}),
			response: type([Customer, "|", ErrorResponse]),
		},

		// Review endpoints
		"GET /pets/:petId/reviews": {
			params: type({ petId: Id }),
			query: PaginationParams,
			response: type([
				type({
					data: [Review, "[]"],
					pagination: PaginationMeta,
					averageRating: "0<=number<=5",
				}),
				"|",
				ErrorResponse,
			]),
		},
		"POST /reviews": {
			body: CreateReviewRequest,
			response: type([Review, "|", ErrorResponse]),
		},

		// Inventory endpoints
		"GET /inventory": {
			query: type({
				"warehouseId?": Id,
				"lowStock?": "boolean",
			}),
			response: type([
				type({
					data: [InventoryItem, "[]"],
				}),
				"|",
				ErrorResponse,
			]),
		},

		// Analytics endpoints
		"GET /analytics/sales": {
			query: type({
				startDate: Timestamp,
				endDate: Timestamp,
				"groupBy?": "'day'|'week'|'month'",
			}),
			response: type([AnalyticsReport, "|", ErrorResponse]),
		},
	});

	type APIT = typeof API.infer;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type APITR = DeepReadonly<APIT>;

	return {} as APITR;
})
	.mean([7.68, "ms"])
	.types([136337, "instantiations"]);
