import { bench } from "@ark/attest";
import * as S from "@effect/schema/Schema";

bench("effect/mega-stress-test typecheck", () => {
  // Deep recursive tree structure with unions
  interface NodeT {
    id: string;
    type: "leaf" | "branch" | "root";
    value: string | number | boolean;
    metadata: {
      tags: readonly string[];
      score: number;
      nested: {
        level: number;
        data: readonly string[];
      };
    };
    children?: readonly NodeT[];
    refs?: readonly NodeT[];
  }

  const Node: S.Schema<NodeT> = S.Struct({
    id: S.String,
    type: S.Literal("leaf", "branch", "root"),
    value: S.Union(S.String, S.Number, S.Boolean),
    metadata: S.Struct({
      tags: S.Array(S.String),
      score: S.Number.pipe(S.greaterThanOrEqualTo(0)),
      nested: S.Struct({
        level: S.Number.pipe(S.int()),
        data: S.Array(S.String),
      }),
    }),
    children: S.optional(S.Array(S.suspend(() => Node))),
    refs: S.optional(S.Array(S.suspend(() => Node))),
  }) as any;

  // Complex discriminated union with heavy nesting
  const EventA = S.Struct({
    kind: S.Literal("a"),
    payload: S.Struct({
      data: S.Array(
        S.Struct({
          id: S.String,
          values: S.Array(S.Union(S.String, S.Number)),
          nested: S.Struct({
            deep: S.Array(
              S.Struct({
                x: S.Number,
                y: S.String,
                z: S.Tuple(S.Number, S.String, S.Boolean),
              }),
            ),
          }),
        }),
      ),
    }),
  });

  const EventB = S.Struct({
    kind: S.Literal("b"),
    payload: S.Struct({
      items: S.Array(
        S.Union(
          S.Struct({ type: S.Literal("x"), val: S.String }),
          S.Struct({ type: S.Literal("y"), val: S.Number }),
          S.Struct({ type: S.Literal("z"), val: S.Boolean }),
        ),
      ),
      meta: S.Struct({
        records: S.Array(
          S.Struct({
            key: S.String,
            data: S.Union(
              S.Array(S.Tuple(S.String, S.Number)),
              S.Struct({ nested: S.Array(S.String) }),
            ),
          }),
        ),
      }),
    }),
  });

  const EventC = S.Struct({
    kind: S.Literal("c"),
    tree: Node,
    relations: S.Array(
      S.Struct({
        from: S.String,
        to: S.String,
        type: S.Literal("parent", "child", "sibling", "ref"),
        metadata: S.Array(
          S.Tuple(S.String, S.Union(S.String, S.Number, S.Boolean)),
        ),
      }),
    ),
  });

  // Massive object with heavy union usage
  const MegaStress = S.Struct({
    // Tree structure
    rootNode: Node,
    allNodes: S.Array(Node),

    // Events
    events: S.Array(S.Union(EventA, EventB, EventC)),

    // Deep nested maps
    config: S.Struct({
      level1: S.Struct({
        level2: S.Struct({
          level3: S.Struct({
            level4: S.Struct({
              level5: S.Struct({
                settings: S.Array(
                  S.Struct({
                    key: S.String,
                    value: S.Union(
                      S.String,
                      S.Number,
                      S.Boolean,
                      S.Array(S.String),
                    ),
                  }),
                ),
              }),
            }),
          }),
        }),
      }),
    }),

    // Complex matrix structure
    matrix: S.Array(
      S.Array(
        S.Array(
          S.Union(
            S.Number,
            S.String,
            S.Struct({
              cell: S.Union(
                S.Tuple(S.Number, S.Number),
                S.Struct({ x: S.Number, y: S.Number }),
              ),
            }),
          ),
        ),
      ),
    ),

    // Polymorphic records
    records: S.Array(
      S.Union(
        S.Struct({
          recordType: S.Literal("type1"),
          data1: S.Struct({
            items: S.Array(S.Tuple(S.String, S.Number, S.Boolean)),
            nested: S.Struct({
              deep: S.Array(S.Union(S.String, S.Number)),
            }),
          }),
        }),
        S.Struct({
          recordType: S.Literal("type2"),
          data2: S.Struct({
            values: S.Array(
              S.Struct({
                id: S.String,
                payload: S.Union(
                  S.String,
                  S.Number,
                  S.Array(S.Tuple(S.String, S.Number)),
                ),
              }),
            ),
          }),
        }),
        S.Struct({
          recordType: S.Literal("type3"),
          data3: S.Struct({
            tree: Node,
            lookup: S.Array(
              S.Struct({
                key: S.String,
                refs: S.Array(S.String),
              }),
            ),
          }),
        }),
      ),
    ),

    // Complex tuple combinations
    tuples: S.Array(
      S.Union(
        S.Tuple(S.String, S.Number),
        S.Tuple(S.Boolean, S.String, S.Number),
        S.Tuple(
          S.Struct({ x: S.Number }),
          S.Array(S.String),
          S.Union(S.String, S.Number),
        ),
      ),
    ),

    // Conditional-like structures
    conditions: S.Array(
      S.Struct({
        if: S.Union(
          S.Struct({ type: S.Literal("string"), value: S.String }),
          S.Struct({ type: S.Literal("number"), value: S.Number }),
          S.Struct({ type: S.Literal("boolean"), value: S.Boolean }),
        ),
        then: S.Struct({
          action: S.Literal("create", "update", "delete"),
          payload: S.Union(
            S.String,
            S.Number,
            S.Struct({ nested: S.Array(S.String) }),
          ),
        }),
        else: S.optional(
          S.Struct({
            fallback: S.Union(S.String, S.Array(S.Tuple(S.String, S.Number))),
          }),
        ),
      }),
    ),

    // Intersection-like structures
    combined: S.Array(
      S.Struct({
        base: S.Struct({
          id: S.String,
          type: S.String,
        }),
        extended: S.Union(
          S.Struct({
            variant: S.Literal("a"),
            extra: S.Array(S.String),
          }),
          S.Struct({
            variant: S.Literal("b"),
            extra: S.Array(S.Number),
          }),
        ),
        metadata: S.Struct({
          tags: S.Array(S.String),
          relations: S.Array(
            S.Tuple(
              S.String,
              S.String,
              S.Literal("one-to-one", "one-to-many", "many-to-many"),
            ),
          ),
        }),
      }),
    ),
  });

  type T = S.Schema.Type<typeof MegaStress>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([813.31, "us"])
  .types([40818, "instantiations"]);
