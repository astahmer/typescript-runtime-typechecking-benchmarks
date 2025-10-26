import glob from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

interface BenchmarkResult {
	library: string;
	testCase: string;
	meanTime: number;
	meanUnit: string;
	instantiations: number;
	filePath: string;
}

// Parse a case file to extract benchmark results
function parseCaseFile(filePath: string): BenchmarkResult | null {
	const content = readFileSync(filePath, "utf-8");

	// Extract library and test case from path
	// e.g., cases/valibot/simple-object-S/case.attest.ts
	const pathParts = filePath.split("/");
	const library = pathParts[pathParts.indexOf("cases") + 1];
	const testCase = pathParts[pathParts.indexOf("cases") + 2];

	// Extract mean time: .mean([value, "unit"])
	const meanMatch = content.match(/\.mean\(\[([0-9.]+),\s*"([^"]+)"\]\)/);
	if (!meanMatch) return null;

	const meanTime = parseFloat(meanMatch[1]);
	const meanUnit = meanMatch[2];

	// Extract instantiations: .types([count, "instantiations"])
	const typesMatch = content.match(
		/\.types\(\[([0-9,]+),\s*"instantiations"\]\)/,
	);
	if (!typesMatch) return null;

	const instantiations = parseInt(typesMatch[1].replace(/,/g, ""), 10);

	return {
		library,
		testCase,
		meanTime,
		meanUnit,
		instantiations,
		filePath,
	};
}

// Convert time to microseconds for comparison
function toMicroseconds(value: number, unit: string): number {
	switch (unit) {
		case "us":
		case "μs":
			return value;
		case "ms":
			return value * 1000;
		case "s":
			return value * 1000000;
		case "ns":
			return value / 1000;
		default:
			return value;
	}
}

// Format time for display
function formatTime(value: number, unit: string): string {
	if (unit === "ms") {
		return `${(value * 1000).toLocaleString()} μs (${value.toFixed(2)} ms)`;
	}
	return `${value.toLocaleString()} ${unit}`;
}

// Generate markdown table for a test case
function generateTableForCase(
	testCase: string,
	results: BenchmarkResult[],
): string {
	const caseResults = results
		.filter((r) => r.testCase === testCase)
		.map((r) => ({
			...r,
			microSeconds: toMicroseconds(r.meanTime, r.meanUnit),
		}))
		.sort((a, b) => a.microSeconds - b.microSeconds);

	if (caseResults.length === 0) return "";

	const fastest = caseResults[0];
	const rows = caseResults.map((r, index) => {
		const libraryName =
			index === 0 ? `**${capitalize(r.library)}**` : capitalize(r.library);
		const time =
			index === 0
				? `**${formatTime(r.meanTime, r.meanUnit)}**`
				: formatTime(r.meanTime, r.meanUnit);
		const insts = r.instantiations.toLocaleString();

		return `| ${libraryName} | ${time} | ${insts} |`;
	});

	const slowest = caseResults[caseResults.length - 1];
	const speedup = (slowest.microSeconds / fastest.microSeconds).toFixed(0);

	return `
| Library | Mean Time | Type Instantiations |
|---------|-----------|---------------------|
${rows.join("\n")}

**Winner**: ${capitalize(fastest.library)} (${speedup}x faster than ${capitalize(slowest.library)}) ⚡
`;
}

function capitalize(str: string): string {
	if (str === "arktype") return "ArkType";
	if (str === "effect") return "Effect";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get test case title and description
function getTestCaseInfo(testCase: string): {
	title: string;
	description: string;
} {
	const info: Record<string, { title: string; description: string }> = {
		"simple-object-S": {
			title: "Simple Object (S)",
			description:
				"A flat object with 4 fields: string, email, number with constraints, and array of enum literals.",
		},
		"arrays-tuples": {
			title: "Arrays & Tuples",
			description:
				"Array of objects with validation + fixed-length tuple `[string, number]`.",
		},
		"nested-M": {
			title: "Nested Medium Complexity",
			description: `Complex nested structure with:
- Address, LineItem, Payment (discriminated union), Order schemas
- User with profile, contacts, addresses array, orders array
- ~50 total properties across 4-5 nesting levels`,
		},
		recursive: {
			title: "Recursive Structure",
			description:
				"Tree/AST-like recursive node: `{ value: string; children?: Node[] }`.",
		},
		"unions-intersections": {
			title: "Unions & Intersections",
			description: `Discriminated union with 3 variants (A, B, C), each containing:
- Shared metadata (date, tags array, flags object)
- Variant-specific fields (arrays, tuples, unions)`,
		},
		"stress-test": {
			title: "Stress Test",
			description: `Large schema with:
- 30 number fields (with min validation)
- 30 string fields
- 20 union fields (string | number | boolean | tuple array)
- 8 nested objects with arrays and enums
- ~100+ total properties`,
		},
		"mega-stress-test": {
			title: "Mega Stress Test 🔥",
			description: `Extreme type complexity test with:
- Recursive tree nodes with bidirectional parent/child references
- Complex discriminated unions (3 event types with nested structures)
- Deep nesting (5+ levels)
- 3D matrix arrays
- Polymorphic records with multiple variants
- Complex tuple combinations
- Intersection-like patterns
- Conditional-like type structures`,
		},
		"petstore-api": {
			title: "Petstore API Schema",
			description: `REST API schema definition with:
- 15+ endpoint definitions with request/response types
- Pet, Order, Customer, Review, Inventory schemas
- Pagination, validation, error handling
- Complex nested structures and unions
- ~30+ schema definitions`,
		},
		"trpc-petstore": {
			title: "tRPC Petstore Router",
			description: `Full-featured tRPC router with:
- 25+ procedures (queries and mutations)
- Pet, Order, Customer, Review, Inventory, Analytics routers
- Complex input/output validation schemas
- Mock data factories
- Discriminated unions for payments, order status
- ~40+ schema definitions with deep nesting`,
		},
	};

	return (
		info[testCase] || {
			title: testCase,
			description: "",
		}
	);
}

// Generate the full markdown document
function generateMarkdown(results: BenchmarkResult[]): string {
	const testCases = [
		"simple-object-S",
		"arrays-tuples",
		"nested-M",
		"recursive",
		"unions-intersections",
		"stress-test",
		"mega-stress-test",
		"petstore-api",
		"trpc-petstore",
	];

	const libraries = [...new Set(results.map((r) => r.library))].sort();

	let markdown = `# TypeScript Type-Check Performance Benchmark Results

Benchmark results comparing TypeScript type-checking performance across runtime validation libraries.

## Methodology

- **What we measure**: Time for TypeScript to type-check inferred types from validation schemas (not runtime validation speed)
- **TypeScript version**: 5.9.3
- **Node version**: LTS
- **Config**: \`noEmit: true\`, \`skipLibCheck: true\`, \`strict: true\`, \`incremental: false\`
- Each test includes a \`DeepReadonly\` mapped type to force full type evaluation

## Libraries Benchmarked

${libraries.map((lib) => `- **${capitalize(lib)}** - Runtime schema validation with type inference`).join("\n")}

---

## Results Summary

`;

	testCases.forEach((testCase, index) => {
		const info = getTestCaseInfo(testCase);
		markdown += `### ${index + 1}. ${info.title}\n\n`;
		markdown += `${info.description}\n\n`;
		markdown += generateTableForCase(testCase, results);
		markdown += `\n---\n\n`;
	});

	// Add summary section
	const avgPerformance = libraries.map((library) => {
		const libraryResults = results.filter((r) => r.library === library);
		const avgMicroseconds =
			libraryResults.reduce(
				(sum, r) => sum + toMicroseconds(r.meanTime, r.meanUnit),
				0,
			) / libraryResults.length;
		return { library, avgMicroseconds };
	});

	avgPerformance.sort((a, b) => a.avgMicroseconds - b.avgMicroseconds);
	const fastest = avgPerformance[0];

	markdown += `## Overall Performance Summary

### Speed Rankings (by average relative performance)

`;

	const medals = ["🥇", "🥈", "🥉"];
	avgPerformance.forEach((perf, index) => {
		const medal = medals[index] || "";
		const ratio = (perf.avgMicroseconds / fastest.avgMicroseconds).toFixed(1);
		const note = index === 0 ? " (baseline)" : ` (${ratio}x slower)`;
		markdown += `${index + 1}. ${medal} **${capitalize(perf.library)}**${note}\n`;
	});

	markdown += `\n---

## Caveats

- Results measured on specific hardware/OS; your mileage may vary
- Type-check time is only one factor in library selection
- Runtime validation performance not measured here
- All schemas designed to be equivalent across libraries
- Some libraries may have features not fully exercised in these benchmarks

---

**Generated**: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
**Benchmark Tool**: @ark/attest v0.51.0
**TypeScript**: 5.9.3
`;

	return markdown;
}

// Main execution
async function main() {
	console.log("🔍 Scanning for benchmark files...");

	const caseFiles = await glob("cases/**/case.attest.ts", {
		cwd: process.cwd(),
	});

	console.log(`📊 Found ${caseFiles.length} benchmark files`);

	const results: BenchmarkResult[] = [];

	for (const file of caseFiles) {
		const result = parseCaseFile(file);
		if (result) {
			results.push(result);
			console.log(
				`  ✓ ${result.library}/${result.testCase}: ${result.meanTime}${result.meanUnit}, ${result.instantiations} instantiations`,
			);
		} else {
			console.log(`  ✗ Failed to parse: ${file}`);
		}
	}

	console.log(`\n📝 Generating README.md...`);

	const markdown = generateMarkdown(results);

	writeFileSync("README.md", markdown, "utf-8");

	console.log("✅ README.md generated successfully!");
	console.log(`\n📈 Summary:`);
	console.log(`  - ${results.length} benchmarks processed`);
	console.log(
		`  - ${[...new Set(results.map((r) => r.library))].length} libraries`,
	);
	console.log(
		`  - ${[...new Set(results.map((r) => r.testCase))].length} test cases`,
	);
}

main().catch(console.error);
