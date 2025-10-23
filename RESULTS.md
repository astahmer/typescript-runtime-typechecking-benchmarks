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
| **Valibot** | **4.86 us** | 9,082 |
| ArkType | 33.86 us | 10,469 |
| Effect | 36.53 us | 5,464 |
| Zod | 81.11 us | 1,033 |

**Winner**: Valibot (17x faster than Zod) ⚡

---

### 2. Arrays & Tuples

Array of objects with validation + fixed-length tuple `[string, number]`.


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **3.58 us** | 7,731 |
| Effect | 31.78 us | 6,391 |
| Zod | 67.93 us | 682 |
| ArkType | 87.65 us | 10,136 |

**Winner**: Valibot (24x faster than ArkType) ⚡

---

### 3. Nested Medium Complexity

Complex nested structure with:
- Address, LineItem, Payment (discriminated union), Order schemas
- User with profile, contacts, addresses array, orders array
- ~50 total properties across 4-5 nesting levels


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **15.82 us** | 14,211 |
| Effect | 141.41 us | 11,569 |
| Zod | 306.92 us | 1,403 |
| ArkType | 411.32 us | 24,084 |

**Winner**: Valibot (26x faster than ArkType) ⚡

---

### 4. Recursive Structure

Tree/AST-like recursive node: `{ value: string; children?: Node[] }`.


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **1.26 us** | 8,985 |
| Zod | 5.32 us | 181 |
| Effect | 17.61 us | 4,474 |
| ArkType | 1,800 μs (1.80 ms) | 7,913 |

**Winner**: Valibot (1429x faster than ArkType) ⚡

---

### 5. Unions & Intersections

Discriminated union with 3 variants (A, B, C), each containing:
- Shared metadata (date, tags array, flags object)
- Variant-specific fields (arrays, tuples, unions)


| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
| **Valibot** | **11.11 us** | 11,706 |
| Effect | 108.71 us | 11,473 |
| Zod | 220.17 us | 2,539 |
| ArkType | 311.09 us | 26,456 |

**Winner**: Valibot (28x faster than ArkType) ⚡

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
| **Valibot** | **125.58 us** | 24,898 |
| Effect | 447.06 us | 23,636 |
| ArkType | 1,340 μs (1.34 ms) | 45,887 |
| Zod | 1,980 μs (1.98 ms) | 3,643 |

**Winner**: Valibot (16x faster than Zod) ⚡

---

## Overall Performance Summary

### Speed Rankings (by average relative performance)

1. 🥇 **Valibot** (baseline)
2. 🥈 **Effect** (4.8x slower)
3. 🥉 **Zod** (16.4x slower)
4.  **ArkType** (24.6x slower)

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
