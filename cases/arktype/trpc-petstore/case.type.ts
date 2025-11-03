import { initTRPC } from "@trpc/server";
import { type } from "arktype";

// XXX.array()
// type.enumerated
// cache types (re-use)
// discriminated union

const t = initTRPC.create();

// Common schemas
const Id = type("string.uuid");
const Timestamp = type("string.date.iso | undefined");
const Email = type("string.email");
const Url = type(/^https?:\/\/.+/);

const PaginationMeta = type({
	page: "number.integer>=1",
	limit: "number.integer>=1",
	total: "number.integer>=0",
	totalPages: "number.integer>=0",
});

// Pet schemas
const PetStatus = type.enumerated("available", "pending", "sold");

const Category = type({
	id: Id,
	name: "string",
	"description?": "string",
	"imageUrl?": Url,
});

const Tag = type({
	id: Id,
	name: "string",
	"color?": /^#[0-9A-Fa-f]{6}$/,
});

const Vaccination = type({
	id: Id,
	name: "string",
	date: "string.date.iso",
	"expiresAt?": "string.date.iso",
	veterinarian: "string",
});

const Pet = type({
	id: Id,
	name: "1<=string<=100",
	category: Category,
	photoUrls: Url.array(),
	tags: Tag.array(),
	status: PetStatus,
	price: "number>=0",
	"weight?": "number>=0.1",
	"age?": "number.integer>=0",
	"birthDate?": "string.date.iso",
	"breed?": "string",
	"description?": "string<=1000",
	"vaccinations?": Vaccination.array(),
	"microchipId?": "string",
	createdAt: Timestamp,
	updatedAt: Timestamp,
});

const CreatePetInput = type({
	name: "1<=string<=100",
	categoryId: Id,
	photoUrls: Url.array(),
	tagIds: Id.array(),
	"status?": PetStatus,
	price: "number>=0",
	"weight?": "number>=0.1",
	"birthDate?": "string.date.iso",
	"breed?": "string",
	"description?": "string<=1000",
});

const UpdatePetInput = type({
	id: Id,
	"name?": "1<=string<=100",
	"categoryId?": Id,
	"photoUrls?": Url.array(),
	"tagIds?": Id.array(),
	"status?": PetStatus,
	"price?": "number>=0",
	"weight?": "number>=0.1",
	"description?": "string<=1000",
});

// Order schemas
const OrderStatus = type.enumerated(
	"placed",
	"approved",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
);
const PaymentStatus = type.enumerated(
	"pending",
	"completed",
	"failed",
	"refunded",
);

const ShippingCountry = type.enumerated(
	"US",
	"CA",
	"GB",
	"FR",
	"DE",
	"AU",
	"JP",
);

const ShippingAddress = type({
	street: "string",
	"unit?": "string",
	city: "string",
	state: "string",
	zipCode: /^\d{5}(-\d{4})?$/,
	country: ShippingCountry,
	phone: /^\+?[\d\s-()]+$/,
});

const PaymentMethodType = type.enumerated(
	"credit_card",
	"paypal",
	"bank_transfer",
	"crypto",
);
const CardBrand = type.enumerated("visa", "mastercard", "amex", "discover");

const PaymentMethod = type({
	type: PaymentMethodType,
	"last4?": "string==4",
	"brand?": CardBrand,
	"expiryMonth?": "1<=number.integer<=12",
	"expiryYear?": "number.integer>=2024",
	"email?": Email,
	"transactionId?": "string",
	"accountNumber?": "string",
	"routingNumber?": "string",
	"bankName?": "string",
	"currency?": type.enumerated("BTC", "ETH", "USDC"),
	"walletAddress?": "string",
	"transactionHash?": "string",
});

const OrderItem = type({
	petId: Id,
	pet: Pet,
	quantity: "number.integer>=1",
	priceAtTime: "number>=0",
});

const Order = type({
	id: Id,
	orderNumber: "string",
	customerId: Id,
	items: OrderItem.array(),
	status: OrderStatus,
	paymentStatus: PaymentStatus,
	shippingAddress: ShippingAddress,
	"billingAddress?": ShippingAddress,
	paymentMethod: PaymentMethod,
	subtotal: "number>=0",
	tax: "number>=0",
	shipping: "number>=0",
	discount: "number>=0",
	total: "number>=0",
	"notes?": "string<=500",
	"trackingNumber?": "string",
	"estimatedDelivery?": Timestamp,
	createdAt: Timestamp,
	updatedAt: Timestamp,
	"paidAt?": Timestamp,
	"shippedAt?": Timestamp,
	"deliveredAt?": Timestamp,
	"cancelledAt?": Timestamp,
	"cancellationReason?": "string | undefined",
});

const CreateOrderInput = type({
	items: type({
		petId: Id,
		quantity: "number.integer>=1",
	}).array(),
	shippingAddress: ShippingAddress,
	"billingAddress?": ShippingAddress,
	paymentMethod: PaymentMethod,
	"notes?": "string<=500",
});

// Customer schemas
const CustomerAddressType = type.enumerated("home", "work", "other");

const CustomerAddress = type({
	id: Id,
	type: CustomerAddressType,
	street: "string",
	"unit?": "string",
	city: "string",
	state: "string",
	zipCode: /^\d{5}(-\d{4})?$/,
	country: ShippingCountry,
	phone: /^\+?[\d\s-()]+$/,
	isDefault: "boolean",
});

const MembershipTier = type.enumerated("bronze", "silver", "gold", "platinum");

const Customer = type({
	id: Id,
	email: Email,
	firstName: "1<=string<=50",
	lastName: "1<=string<=50",
	"phone?": /^\+?[\d\s-()]+$/,
	"dateOfBirth?": "string.date.iso",
	addresses: CustomerAddress.array(),
	preferences: {
		newsletter: "boolean",
		smsNotifications: "boolean",
		emailNotifications: "boolean",
		favoriteCategories: Id.array(),
		"preferredPaymentMethod?": PaymentMethodType,
	},
	loyaltyPoints: "number.integer>=0",
	membershipTier: MembershipTier,
	createdAt: Timestamp,
	updatedAt: Timestamp,
	"lastLoginAt?": Timestamp,
	emailVerified: "boolean",
});

const RegisterInput = type({
	email: Email,
	password: "8<=string<=100",
	firstName: "1<=string<=50",
	lastName: "1<=string<=50",
	"phone?": /^\+?[\d\s-()]+$/,
	"dateOfBirth?": "string.date.iso",
});

const UpdateProfileInput = type({
	"firstName?": "1<=string<=50",
	"lastName?": "1<=string<=50",
	"phone?": /^\+?[\d\s-()]+$/,
	"dateOfBirth?": "string.date.iso",
	"preferences?": {
		newsletter: "boolean",
		smsNotifications: "boolean",
		emailNotifications: "boolean",
		favoriteCategories: Id.array(),
		"preferredPaymentMethod?": PaymentMethodType,
	},
});

// Review schemas
const ReviewImage = type({
	id: Id,
	url: Url,
	"caption?": "string",
});

const Review = type({
	id: Id,
	petId: Id,
	customerId: Id,
	customer: {
		id: Id,
		firstName: "string",
		lastName: "string",
		membershipTier: MembershipTier,
	},
	rating: "1<=number.integer<=5",
	title: "1<=string<=200",
	comment: "1<=string<=2000",
	"images?": ReviewImage.array(),
	"pros?": "string[]",
	"cons?": "string[]",
	wouldRecommend: "boolean",
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

const CreateReviewInput = type({
	petId: Id,
	rating: "1<=number.integer<=5",
	title: "1<=string<=200",
	comment: "1<=string<=2000",
	"images?": type({
		url: Url,
		"caption?": "string",
	}).array(),
	"pros?": "string[]",
	"cons?": "string[]",
	wouldRecommend: "boolean",
});

// Inventory schemas
const Warehouse = type({
	id: Id,
	name: "string",
	code: "string",
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
	capacity: "number.integer>=0",
	isActive: "boolean",
});

const InventoryItem = type({
	petId: Id,
	pet: Pet,
	quantityAvailable: "number.integer>=0",
	quantityReserved: "number.integer>=0",
	quantityInTransit: "number.integer>=0",
	reorderLevel: "number.integer>=0",
	reorderQuantity: "number.integer>=0",
	warehouse: Warehouse,
	"location?": {
		aisle: "string",
		shelf: "string",
		bin: "string",
	},
	"lastRestocked?": Timestamp,
	"nextRestockDate?": Timestamp,
	"supplier?": {
		id: Id,
		name: "string",
		contact: Email,
	},
});

// Analytics schemas
const SalesMetrics = type({
	totalRevenue: "number>=0",
	totalOrders: "number.integer>=0",
	averageOrderValue: "number>=0",
	conversionRate: "0<=number<=100",
	topSellingPets: type({
		petId: Id,
		name: "string",
		category: "string",
		unitsSold: "number.integer>=0",
		revenue: "number>=0",
	}).array(),
	revenueByCategory: type({
		categoryId: Id,
		categoryName: "string",
		revenue: "number>=0",
		orders: "number.integer>=0",
	}).array(),
});

const CustomerMetrics = type({
	newCustomers: "number.integer>=0",
	returningCustomers: "number.integer>=0",
	churnRate: "0<=number<=100",
	customerLifetimeValue: "number>=0",
	averageOrdersPerCustomer: "number>=0",
});

const InventoryMetrics = type({
	lowStockItems: "number.integer>=0",
	outOfStockItems: "number.integer>=0",
	totalValue: "number>=0",
	turnoverRate: "number>=0",
});

const AnalyticsReport = type({
	period: {
		start: Timestamp,
		end: Timestamp,
		type: type.enumerated("day", "week", "month", "quarter", "year"),
	},
	sales: SalesMetrics,
	customers: CustomerMetrics,
	inventory: InventoryMetrics,
	trends: type({
		date: Timestamp,
		revenue: "number",
		orders: "number.integer",
		newCustomers: "number.integer",
	}).array(),
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
				type({
					page: "number.integer>=1",
					limit: "1<=number.integer<=100",
					"sortBy?": type.enumerated("name", "createdAt", "price"),
					"sortOrder?": type.enumerated("asc", "desc"),
					"status?": PetStatus,
					"categoryId?": Id,
					"minPrice?": "number>=0",
					"maxPrice?": "number>=0",
					"search?": "string",
				}),
			)
			.output(
				type({
					data: Pet.array(),
					pagination: PaginationMeta,
				}),
			)
			.query(() => ({ data: [mockPet], pagination: mockPagination })),

		getById: t.procedure
			.input(type({ id: Id }))
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
			.input(type({ id: Id }))
			.output(type({ success: "boolean" }))
			.mutation(() => ({ success: true })),

		uploadPhoto: t.procedure
			.input(
				type({
					petId: Id,
					photoUrl: Url,
					"caption?": "string<=200",
				}),
			)
			.output(Pet)
			.mutation(() => mockPet),
	}),

	// Order procedures
	order: t.router({
		list: t.procedure
			.input(
				type({
					page: "number.integer>=1",
					limit: "1<=number.integer<=100",
					"sortBy?": type.enumerated("name", "createdAt", "price"),
					"sortOrder?": type.enumerated("asc", "desc"),
					"customerId?": Id,
					"status?": OrderStatus,
					"startDate?": Timestamp,
					"endDate?": Timestamp,
				}),
			)
			.output(
				type({
					data: Order.array(),
					pagination: PaginationMeta,
				}),
			)
			.query(() => ({ data: [mockOrder], pagination: mockPagination })),

		getById: t.procedure
			.input(type({ id: Id }))
			.output(Order)
			.query(() => mockOrder),

		create: t.procedure
			.input(CreateOrderInput)
			.output(Order)
			.mutation(() => mockOrder),

		updateStatus: t.procedure
			.input(
				type({
					id: Id,
					status: OrderStatus,
					"trackingNumber?": "string",
					"cancellationReason?": "string",
				}),
			)
			.output(Order)
			.mutation(() => mockOrder),

		cancel: t.procedure
			.input(
				type({
					id: Id,
					reason: "string",
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
				type({
					street: "string",
					"unit?": "string",
					city: "string",
					state: "string",
					zipCode: /^\d{5}(-\d{4})?$/,
					country: ShippingCountry,
					phone: /^\+?[\d\s-()]+$/,
					type: CustomerAddressType,
					isDefault: "boolean",
				}),
			)
			.output(Customer)
			.mutation(() => mockCustomer),

		deleteAddress: t.procedure
			.input(type({ addressId: Id }))
			.output(Customer)
			.mutation(() => mockCustomer),
	}),

	// Review procedures
	review: t.router({
		list: t.procedure
			.input(
				type({
					page: "number.integer>=1",
					limit: "1<=number.integer<=100",
					"sortBy?": type.enumerated("name", "createdAt", "price"),
					"sortOrder?": type.enumerated("asc", "desc"),
					petId: Id,
					"minRating?": "1<=number.integer<=5",
					"verified?": "boolean",
				}),
			)
			.output(
				type({
					data: Review.array(),
					pagination: PaginationMeta,
					averageRating: "0<=number<=5",
					ratingDistribution: {
						"5": "number.integer>=0",
						"4": "number.integer>=0",
						"3": "number.integer>=0",
						"2": "number.integer>=0",
						"1": "number.integer>=0",
					},
				}),
			)
			.query(() => ({
				data: [mockReview],
				pagination: mockPagination,
				averageRating: 4.5,
				ratingDistribution: { "5": 50, "4": 30, "3": 15, "2": 3, "1": 2 },
			})),

		getById: t.procedure
			.input(type({ id: Id }))
			.output(Review)
			.query(() => mockReview),

		create: t.procedure
			.input(CreateReviewInput)
			.output(Review)
			.mutation(() => mockReview),

		markHelpful: t.procedure
			.input(
				type({
					reviewId: Id,
					helpful: "boolean",
				}),
			)
			.output(Review)
			.mutation(() => mockReview),
	}),

	// Inventory procedures
	inventory: t.router({
		list: t.procedure
			.input(
				type({
					"warehouseId?": Id,
					"lowStock?": "boolean",
					"outOfStock?": "boolean",
				}),
			)
			.output(
				type({
					data: InventoryItem.array(),
				}),
			)
			.query(() => ({ data: [mockInventoryItem] })),

		getByPetId: t.procedure
			.input(type({ petId: Id }))
			.output(InventoryItem.array())
			.query(() => [mockInventoryItem]),

		updateStock: t.procedure
			.input(
				type({
					petId: Id,
					warehouseId: Id,
					quantityChange: "number.integer",
					reason: type.enumerated(
						"purchase",
						"return",
						"restock",
						"adjustment",
						"damage",
					),
				}),
			)
			.output(InventoryItem)
			.mutation(() => mockInventoryItem),
	}),

	// Analytics procedures
	analytics: t.router({
		sales: t.procedure
			.input(
				type({
					startDate: Timestamp,
					endDate: Timestamp,
					groupBy: type.enumerated("day", "week", "month"),
				}),
			)
			.output(AnalyticsReport)
			.query(() => mockAnalyticsReport),

		dashboard: t.procedure
			.output(
				type({
					todaySales: "number>=0",
					todayOrders: "number.integer>=0",
					pendingOrders: "number.integer>=0",
					lowStockAlerts: "number.integer>=0",
					newCustomers: "number.integer>=0",
					recentOrders: Order.array(),
					topProducts: Pet.array(),
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
		list: t.procedure.output(Category.array()).query(() => [mockCategory]),

		create: t.procedure
			.input(
				type({
					name: "1<=string<=100",
					"description?": "string<=500",
					"imageUrl?": Url,
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
