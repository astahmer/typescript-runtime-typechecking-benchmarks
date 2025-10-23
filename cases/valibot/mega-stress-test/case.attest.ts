import { bench } from "@ark/attest";
import * as v from "valibot";
import type { InferOutput } from "valibot";

bench("valibot/mega-stress-test typecheck", () => {
  // Deep recursive tree structure with unions
  type NodeT = {
    id: string;
    type: "leaf" | "branch" | "root";
    value: string | number | boolean;
    metadata: {
      tags: string[];
      score: number;
      nested: {
        level: number;
        data: string[];
      };
    };
    children?: NodeT[];
    refs?: NodeT[];
  };

  const Node = v.object({
    id: v.string(),
    type: v.picklist(["leaf", "branch", "root"]),
    value: v.union([v.string(), v.number(), v.boolean()]),
    metadata: v.object({
      tags: v.array(v.string()),
      score: v.pipe(v.number(), v.minValue(0)),
      nested: v.object({
        level: v.pipe(v.number(), v.integer()),
        data: v.array(v.string()),
      }),
    }),
    children: v.optional(
      v.array(v.lazy((): v.GenericSchema<NodeT> => Node as v.GenericSchema<NodeT>)),
    ),
    refs: v.optional(
      v.array(v.lazy((): v.GenericSchema<NodeT> => Node as v.GenericSchema<NodeT>)),
    ),
  });

  // Complex discriminated union with heavy nesting
  const EventA = v.object({
    kind: v.literal("a"),
    payload: v.object({
      data: v.array(
        v.object({
          id: v.string(),
          values: v.array(v.union([v.string(), v.number()])),
          nested: v.object({
            deep: v.array(
              v.object({
                x: v.number(),
                y: v.string(),
                z: v.tuple([v.number(), v.string(), v.boolean()]),
              }),
            ),
          }),
        }),
      ),
    }),
  });

  const EventB = v.object({
    kind: v.literal("b"),
    payload: v.object({
      items: v.array(
        v.union([
          v.object({ type: v.literal("x"), val: v.string() }),
          v.object({ type: v.literal("y"), val: v.number() }),
          v.object({ type: v.literal("z"), val: v.boolean() }),
        ]),
      ),
      meta: v.object({
        records: v.array(
          v.object({
            key: v.string(),
            data: v.union([
              v.array(v.tuple([v.string(), v.number()])),
              v.object({ nested: v.array(v.string()) }),
            ]),
          }),
        ),
      }),
    }),
  });

  const EventC = v.object({
    kind: v.literal("c"),
    tree: Node,
    relations: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        type: v.picklist(["parent", "child", "sibling", "ref"]),
        metadata: v.array(
          v.tuple([v.string(), v.union([v.string(), v.number(), v.boolean()])]),
        ),
      }),
    ),
  });

  // Massive object with heavy union usage
  const MegaStress = v.object({
    // Tree structure
    rootNode: Node,
    allNodes: v.array(Node),

    // Events
    events: v.array(v.union([EventA, EventB, EventC])),

    // Deep nested maps
    config: v.object({
      level1: v.object({
        level2: v.object({
          level3: v.object({
            level4: v.object({
              level5: v.object({
                settings: v.array(
                  v.object({
                    key: v.string(),
                    value: v.union([
                      v.string(),
                      v.number(),
                      v.boolean(),
                      v.array(v.string()),
                    ]),
                  }),
                ),
              }),
            }),
          }),
        }),
      }),
    }),

    // Complex matrix structure
    matrix: v.array(
      v.array(
        v.array(
          v.union([
            v.number(),
            v.string(),
            v.object({
              cell: v.union([
                v.tuple([v.number(), v.number()]),
                v.object({ x: v.number(), y: v.number() }),
              ]),
            }),
          ]),
        ),
      ),
    ),

    // Polymorphic records
    records: v.array(
      v.union([
        v.object({
          recordType: v.literal("type1"),
          data1: v.object({
            items: v.array(v.tuple([v.string(), v.number(), v.boolean()])),
            nested: v.object({
              deep: v.array(v.union([v.string(), v.number()])),
            }),
          }),
        }),
        v.object({
          recordType: v.literal("type2"),
          data2: v.object({
            values: v.array(
              v.object({
                id: v.string(),
                payload: v.union([
                  v.string(),
                  v.number(),
                  v.array(v.tuple([v.string(), v.number()])),
                ]),
              }),
            ),
          }),
        }),
        v.object({
          recordType: v.literal("type3"),
          data3: v.object({
            tree: Node,
            lookup: v.array(
              v.object({
                key: v.string(),
                refs: v.array(v.string()),
              }),
            ),
          }),
        }),
      ]),
    ),

    // Complex tuple combinations
    tuples: v.array(
      v.union([
        v.tuple([v.string(), v.number()]),
        v.tuple([v.boolean(), v.string(), v.number()]),
        v.tuple([
          v.object({ x: v.number() }),
          v.array(v.string()),
          v.union([v.string(), v.number()]),
        ]),
      ]),
    ),

    // Conditional-like structures
    conditions: v.array(
      v.object({
        if: v.union([
          v.object({ type: v.literal("string"), value: v.string() }),
          v.object({ type: v.literal("number"), value: v.number() }),
          v.object({ type: v.literal("boolean"), value: v.boolean() }),
        ]),
        then: v.object({
          action: v.picklist(["create", "update", "delete"]),
          payload: v.union([
            v.string(),
            v.number(),
            v.object({ nested: v.array(v.string()) }),
          ]),
        }),
        else: v.optional(
          v.object({
            fallback: v.union([
              v.string(),
              v.array(v.tuple([v.string(), v.number()])),
            ]),
          }),
        ),
      }),
    ),

    // Intersection-like structures
    combined: v.array(
      v.object({
        base: v.object({
          id: v.string(),
          type: v.string(),
        }),
        extended: v.union([
          v.object({
            variant: v.literal("a"),
            extra: v.array(v.string()),
          }),
          v.object({
            variant: v.literal("b"),
            extra: v.array(v.number()),
          }),
        ]),
        metadata: v.object({
          tags: v.array(v.string()),
          relations: v.array(
            v.tuple([
              v.string(),
              v.string(),
              v.picklist(["one-to-one", "one-to-many", "many-to-many"]),
            ]),
          ),
        }),
      }),
    ),
  });

  type T = InferOutput<typeof MegaStress>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([60.75, "us"])
  .types([30371, "instantiations"]);
