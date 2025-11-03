import { scope, type } from "arktype";

// Deep recursive tree structure with unions
const types = scope({
	Node: {
		id: "string",
		type: type.enumerated("leaf", "branch", "root"),
		value: "string | number | boolean",
		metadata: {
			tags: "string[]",
			score: "number >= 0",
			nested: {
				level: "number.integer",
				data: "string[]",
			},
		},
		"children?": "Node[]",
		"refs?": "Node[]",
	},
}).export();

const Node = types.Node;

// Complex discriminated union with heavy nesting
const DataValue = type({
	id: "string",
	values: type("string | number").array(),
	nested: {
		deep: type({
			x: "number",
			y: "string",
			z: type(["number", "string", "boolean"]).array(),
		}).array(),
	},
});

const EventA = type({
	kind: type.enumerated("a"),
	payload: {
		data: DataValue.array(),
	},
});

const ItemX = type({ type: type.enumerated("x"), val: "string" });
const ItemY = type({ type: type.enumerated("y"), val: "number" });
const ItemZ = type({ type: type.enumerated("z"), val: "boolean" });
const ItemUnion = ItemX.or(ItemY).or(ItemZ);

const DataTupleArr = type(["string", "number"]).array();
const DataNested = type({ nested: "string[]" });
const DataUnion = DataTupleArr.or(DataNested);

const EventBMetadata = type({
	key: "string",
	data: DataUnion,
});

const EventB = type({
	kind: type.enumerated("b"),
	payload: {
		items: ItemUnion.array(),
		meta: {
			records: EventBMetadata.array(),
		},
	},
});

const MetaTuple = type(["string", "string | number | boolean"]);

const EventCRelation = type({
	from: "string",
	to: "string",
	type: type.enumerated("parent", "child", "sibling", "ref"),
	metadata: MetaTuple.array(),
});

const EventC = type({
	kind: type.enumerated("c"),
	tree: Node,
	relations: EventCRelation.array(),
});

// Settings structure that's reused
const Settings = type({
	key: "string",
	value: "string | number | boolean | string[]",
}).array();

const MatrixCell = type("number | string")
	.or(type({ cell: ["number", "number"] }))
	.or(type({ cell: { x: "number", y: "number" } }));

const RecordType1 = type({
	recordType: type.enumerated("type1"),
	data1: {
		items: type(["string", "number", "boolean"]).array(),
		nested: { deep: type("string | number").array() },
	},
});

const RecordType2 = type({
	recordType: type.enumerated("type2"),
	data2: {
		values: type({
			id: "string",
			payload: type("string | number").or(type(["string", "number"])),
		}).array(),
	},
});

const RecordType3 = type({
	recordType: type.enumerated("type3"),
	data3: {
		tree: Node,
		lookup: type({ key: "string", refs: "string[]" }).array(),
	},
});

const RecordUnion = RecordType1.or(RecordType2).or(RecordType3);

const TupleOption = type(["string", "number"])
	.or(["boolean", "string", "number"])
	.or([{ x: "number" }, "string[]", "string | number"]);

const ConditionBase = type({ type: type.enumerated("string"), value: "string" })
	.or({ type: type.enumerated("number"), value: "number" })
	.or({ type: type.enumerated("boolean"), value: "boolean" });

const ConditionItem = type({
	if: ConditionBase,
	then: {
		action: type.enumerated("create", "update", "delete"),
		payload: type("string | number").or({ nested: "string[]" }),
	},
	"else?": {
		fallback: type("string").or(type(["string", "number"])),
	},
});

const CombinedVariant = type({
	variant: type.enumerated("a"),
	extra: "string[]",
}).or({
	variant: type.enumerated("b"),
	extra: "number[]",
});

const CombinedRelation = type([
	"string",
	"string",
	type.enumerated("one-to-one", "one-to-many", "many-to-many"),
]);

const CombinedItem = type({
	base: {
		id: "string",
		type: "string",
	},
	extended: CombinedVariant,
	metadata: {
		tags: "string[]",
		relations: CombinedRelation.array(),
	},
});

// Massive object with heavy union usage
const MegaStress = type({
	// Tree structure
	rootNode: Node,
	allNodes: Node.array(),

	// Events
	events: EventA.or(EventB).or(EventC).array(),

	// Deep nested maps
	config: {
		level1: {
			level2: {
				level3: {
					level4: {
						level5: {
							settings: Settings,
						},
					},
				},
			},
		},
	},

	// Complex matrix structure
	matrix: MatrixCell.array().array().array(),

	// Polymorphic records
	records: RecordUnion.array(),

	// Complex tuple combinations
	tuples: TupleOption.array(),

	// Conditional-like structures
	conditions: ConditionItem.array(),

	// Intersection-like structures
	combined: CombinedItem.array(),
});

type T = typeof MegaStress.infer;

type DeepReadonly<T> = T extends (...args: any) => any
	? T
	: T extends object
		? { readonly [K in keyof T]: DeepReadonly<T[K]> }
		: T;

type TR = DeepReadonly<T>;
