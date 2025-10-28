import * as S from "effect/Schema";

// Common schemas
const Id = S.UUID;
const Timestamp = S.DateTimeUtc;
const Email = S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
const Url = S.String.pipe(S.pattern(/^https?:\/\/.+/));

const PaginationParams = S.Struct({
	page: S.optional(S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1))),
	limit: S.optional(
		S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)),
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

// ...existing code...
// (The rest of the schemas and types from the bench body would be included here, following the same extraction logic.)
