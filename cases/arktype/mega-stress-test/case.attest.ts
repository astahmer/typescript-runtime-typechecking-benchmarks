import { scope, type } from "arktype";
import { bench } from "@ark/attest";

bench("arktype/mega-stress-test typecheck", () => {
  // Deep recursive tree structure with unions
  const types = scope({
    Node: {
      id: "string",
      type: "'leaf'|'branch'|'root'",
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
  const EventA = type({
    kind: "'a'",
    payload: {
      data: type({
        id: "string",
        values: "(string | number)[]",
        nested: {
          deep: type({
            x: "number",
            y: "string",
            z: ["number", "string", "boolean"],
          }).array(),
        },
      }).array(),
    },
  });

  const ItemX = type({ type: "'x'", val: "string" });
  const ItemY = type({ type: "'y'", val: "number" });
  const ItemZ = type({ type: "'z'", val: "boolean" });
  const ItemUnion = ItemX.or(ItemY).or(ItemZ);

  const DataTupleArr = type(["string", "number"]).array();
  const DataNested = type({ nested: "string[]" });
  const DataUnion = DataTupleArr.or(DataNested);

  const EventB = type({
    kind: "'b'",
    payload: {
      items: ItemUnion.array(),
      meta: {
        records: type({
          key: "string",
          data: DataUnion,
        }).array(),
      },
    },
  });

  const MetaTuple = type(["string", "string | number | boolean"]);

  const EventC = type({
    kind: "'c'",
    tree: Node,
    relations: type({
      from: "string",
      to: "string",
      type: "'parent'|'child'|'sibling'|'ref'",
      metadata: MetaTuple.array(),
    }).array(),
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
                settings: type({
                  key: "string",
                  value: "string | number | boolean | string[]",
                }).array(),
              },
            },
          },
        },
      },
    },

    // Complex matrix structure
    matrix: type("number | string")
      .or(type({ cell: ["number", "number"] }))
      .or(type({ cell: { x: "number", y: "number" } }))
      .array()
      .array()
      .array(),

    // Polymorphic records
    records: type({
      recordType: "'type1'",
      data1: {
        items: [["string", "number", "boolean"]],
        nested: { deep: "(string | number)[]" },
      },
    })
      .or(
        type({
          recordType: "'type2'",
          data2: {
            values: type({
              id: "string",
              payload: type("string | number").or([["string", "number"]]),
            }).array(),
          },
        }),
      )
      .or(
        type({
          recordType: "'type3'",
          data3: {
            tree: Node,
            lookup: type({ key: "string", refs: "string[]" }).array(),
          },
        }),
      )
      .array(),

    // Complex tuple combinations
    tuples: type(["string", "number"])
      .or(["boolean", "string", "number"])
      .or([{ x: "number" }, "string[]", "string | number"])
      .array(),

    // Conditional-like structures
    conditions: type({
      if: type({ type: "'string'", value: "string" })
        .or({ type: "'number'", value: "number" })
        .or({ type: "'boolean'", value: "boolean" }),
      then: {
        action: "'create'|'update'|'delete'",
        payload: type("string | number").or({ nested: "string[]" }),
      },
      "else?": {
        fallback: type("string").or([["string", "number"]]),
      },
    }).array(),

    // Intersection-like structures
    combined: type({
      base: {
        id: "string",
        type: "string",
      },
      extended: type({
        variant: "'a'",
        extra: "string[]",
      }).or({
        variant: "'b'",
        extra: "number[]",
      }),
      metadata: {
        tags: "string[]",
        relations: [
          ["string", "string", "'one-to-one'|'one-to-many'|'many-to-many'"],
        ],
      },
    }).array(),
  });

  type T = typeof MegaStress.infer;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([15.39, "ms"])
  .types([94176, "instantiations"]);
