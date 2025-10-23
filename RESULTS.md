# TypeScript Type-Check Performance Benchmark Results

Benchmark results comparing TypeScript type-checking performance across runtime validation libraries.

## Methodology

- **What we measure**: Time for TypeScript to type-check inferred types from validation schemas (not runtime validation speed)
- **TypeScript version**: 5.9.3
- **Node version**: LTS
- **Config**: `noEmit: true`, `skipLibCheck: true`, `strict: true`, `incremental: false`
- Each test includes a `DeepReadonly` mapped type to force full type evaluation

## Libraries Benchmarked

- **ArkType** - Runtime schema validation with type inference
- **Effect** - Runtime schema validation with type inference
- **Valibot** - Runtime schema validation with type inference
- **Zod** - Runtime schema validation with type inference

---

## Results Summary

### 1. Simple Object (S)

A flat object with 4 fields: string, email, number with constraints, and array of enum literals.


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **4.44 us** | 9,082 |
| ArkType | 33.47 us | 10,469 |
| Effect | 40.96 us | 5,464 |
| Zod | 87.97 us | 1,033 |

**Winner**: Valibot (20x faster than Zod) ⚡

---

### 2. Arrays & Tuples

Array of objects with validation + fixed-length tuple `[string, number]`.


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **3.39 us** | 7,731 |
| Effect | 34.51 us | 6,391 |
| Zod | 64.6 us | 682 |
| ArkType | 89.9 us | 10,136 |

**Winner**: Valibot (27x faster than ArkType) ⚡

---

### 3. Nested Medium Complexity

Complex nested structure with:
- Address, LineItem, Payment (discriminated union), Order schemas
- User with profile, contacts, addresses array, orders array
- ~50 total properties across 4-5 nesting levels


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **15.65 us** | 14,211 |
| Effect | 151.8 us | 11,569 |
| Zod | 295.45 us | 1,403 |
| ArkType | 439.12 us | 24,084 |

**Winner**: Valibot (28x faster than ArkType) ⚡

---

### 4. Recursive Structure

Tree/AST-like recursive node: `{ value: string; children?: Node[] }`.


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **1.28 us** | 8,985 |
| Zod | 4.86 us | 181 |
| Effect | 19.02 us | 4,474 |
| ArkType | 1,310 μs (1.31 ms) | 7,913 |

**Winner**: Valibot (1023x faster than ArkType) ⚡

---

### 5. Unions & Intersections

Discriminated union with 3 variants (A, B, C), each containing:
- Shared metadata (date, tags array, flags object)
- Variant-specific fields (arrays, tuples, unions)


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **9.88 us** | 11,706 |
| Effect | 104.25 us | 11,473 |
| Zod | 213.32 us | 2,539 |
| ArkType | 325.69 us | 26,456 |

**Winner**: Valibot (33x faster than ArkType) ⚡

---

### 6. Stress Test

Large schema with:
- 30 number fields (with min validation)
- 30 string fields
- 20 union fields (string | number | boolean | tuple array)
- 8 nested objects with arrays and enums
- ~100+ total properties


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **124.23 us** | 24,898 |
| Effect | 431.52 us | 23,636 |
| ArkType | 1,140 μs (1.14 ms) | 45,887 |
| Zod | 2,210 μs (2.21 ms) | 3,643 |

**Winner**: Valibot (18x faster than Zod) ⚡

---

### 7. Mega Stress Test 🔥

Extreme type complexity test with:
- Recursive tree nodes with bidirectional parent/child references
- Complex discriminated unions (3 event types with nested structures)
- Deep nesting (5+ levels)
- 3D matrix arrays
- Polymorphic records with multiple variants
- Complex tuple combinations
- Intersection-like patterns
- Conditional-like type structures


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **60.75 us** | 30,371 |
| Effect | 813.31 us | 40,818 |
| Zod | 1,130 μs (1.13 ms) | 4,223 |
| ArkType | 16,900 μs (16.90 ms) | 94,176 |

**Winner**: Valibot (278x faster than ArkType) ⚡

---

## Overall Performance Summary

### Speed Rankings (by average relative performance)

1. 🥇 **Valibot** (baseline)
2. 🥈 **Effect** (7.3x slower)
3. 🥉 **Zod** (18.2x slower)
4.  **ArkType** (92.2x slower)

---

## Caveats

- Results measured on specific hardware/OS; your mileage may vary
- Type-check time is only one factor in library selection
- Runtime validation performance not measured here
- All schemas designed to be equivalent across libraries
- Some libraries may have features not fully exercised in these benchmarks

---

**Generated**: October 2025
**Benchmark Tool**: @ark/attest v0.51.0
**TypeScript**: 5.9.3
