import { spawn } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Effect } from "effect";
import fg from "fast-glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NUM_RUNS = process.env.NUM_RUNS ? parseInt(process.env.NUM_RUNS, 10) : 10;

interface Stats {
	mean: number;
	median: number;
	min: number;
	max: number;
	stdDev: number;
}

interface DiagnosticsMetrics {
	files: number;
	lines: number;
	identifiers: number;
	symbols: number;
	types: number;
	instantiations: number;
	memoryUsed: number; // in KB
	ioRead: number; // in seconds
	ioWrite: number; // in seconds
	parseTime: number; // in seconds
	bindTime: number; // in seconds
	checkTime: number; // in seconds
	emitTime: number; // in seconds
	totalTime: number; // in seconds
}

function calculateStats(values: number[]): Stats {
	const sorted = [...values].sort((a, b) => a - b);
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const median =
		sorted.length % 2 === 0
			? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
			: sorted[Math.floor(sorted.length / 2)];

	const variance =
		values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
		values.length;
	const stdDev = Math.sqrt(variance);

	return {
		mean: Number(mean.toFixed(4)),
		median: Number(median.toFixed(4)),
		min: Number(sorted[0].toFixed(4)),
		max: Number(sorted[sorted.length - 1].toFixed(4)),
		stdDev: Number(stdDev.toFixed(4)),
	};
}

function parseMetricValue(
	line: string,
	key: string,
	suffix?: string,
): number | null {
	let regex: RegExp;
	if (suffix) {
		regex = new RegExp(`^${key}:\\s+([\\d.]+)${suffix}$`);
	} else {
		regex = new RegExp(`^${key}:\\s+([\\d.]+)$`);
	}
	const match = line.match(regex);
	return match ? parseFloat(match[1]) : null;
}

function parseDiagnosticsOutput(output: string): DiagnosticsMetrics | null {
	const lines = output.split("\n");
	const metrics: Partial<DiagnosticsMetrics> = {};

	const timeMetrics = {
		ioRead: "I/O read",
		ioWrite: "I/O write",
		parseTime: "Parse time",
		bindTime: "Bind time",
		checkTime: "Check time",
		emitTime: "Emit time",
		totalTime: "Total time",
	} as const;

	const intMetrics = {
		files: "Files",
		lines: "Lines",
		identifiers: "Identifiers",
		symbols: "Symbols",
		types: "Types",
		instantiations: "Instantiations",
	} as const;

	for (const line of lines) {
		// Parse time metrics with "s" suffix
		for (const [key, label] of Object.entries(timeMetrics)) {
			const val = parseMetricValue(line, label, "s");
			if (val !== null) {
				(metrics as Record<string, number>)[key] = val;
			}
		}

		// Parse integer metrics
		for (const [key, label] of Object.entries(intMetrics)) {
			const val = parseMetricValue(line, label);
			if (val !== null) {
				(metrics as Record<string, number>)[key] = val;
			}
		}

		// Parse memory metric with "K" suffix
		if (line.startsWith("Memory used:")) {
			const match = line.match(/Memory used:\s+(\d+)K/);
			if (match) metrics.memoryUsed = parseInt(match[1], 10);
		}
	}

	// Validate that all required metrics were found
	if (
		metrics.files !== undefined &&
		metrics.lines !== undefined &&
		metrics.identifiers !== undefined &&
		metrics.symbols !== undefined &&
		metrics.types !== undefined &&
		metrics.instantiations !== undefined &&
		metrics.memoryUsed !== undefined &&
		metrics.ioRead !== undefined &&
		metrics.ioWrite !== undefined &&
		metrics.parseTime !== undefined &&
		metrics.bindTime !== undefined &&
		metrics.checkTime !== undefined &&
		metrics.emitTime !== undefined &&
		metrics.totalTime !== undefined
	) {
		return metrics as DiagnosticsMetrics;
	}

	return null;
}

interface CaseResult {
	library: string;
	meanCheckTime: number;
	medianCheckTime: number;
	checkTimeStats: Stats;
	runs: number;
	totalTime: number;
	memoryUsed: number;
	files: number;
	types: number;
	instantiations: number;
	ratioVsFastest: number;
}

interface LibraryTotal {
	library: string;
	meanCheckTime: number;
	medianCheckTime: number;
	totalTime: number;
	memoryUsed: number;
	fileCount: number;
	typeCount: number;
	instantiationCount: number;
	ratioVsFastest?: number;
}

async function runCheck() {
	const root = dirname(__dirname);
	const pattern = `cases/*/*/tsconfig.type.json`;
	const entries = await fg(pattern, { cwd: root, absolute: true });

	if (entries.length === 0) {
		console.error(
			`No type config files found. Expected 'cases/*/*/tsconfig.type.json'.`,
		);
		process.exit(1);
	}

	await Effect.runPromise(
		Effect.gen(function* () {
			const results = yield* Effect.all(
				entries.map((configFile) =>
					Effect.tryPromise(() =>
						runTypeCheckMultiple(configFile, NUM_RUNS).then((result) => ({
							...result,
							configFile,
						})),
					).pipe(
						Effect.catchAll((error) => {
							console.error(`Error checking ${configFile}: ${error}`);
							return Effect.succeed(null);
						}),
					),
				),
			);

			const validResults = results.filter(
				(r): r is Exclude<typeof r, null> => r !== null,
			);

			// Parse results
			const parsed = validResults.map(
				({ metrics, configFile, checkTimeStats, runs }) => {
					const rel = relative(root, configFile);
					const parts = rel.split("/");
					const library = parts[1];
					const testCase = parts[2];
					return { rel, library, testCase, metrics, checkTimeStats, runs };
				},
			);

			// Group by case and sort libraries by ascending checkTime (using median)
			const cases: Record<string, CaseResult[]> = {};

			for (const p of parsed) {
				(cases[p.testCase] ||= []).push({
					library: p.library,
					meanCheckTime: p.checkTimeStats.mean,
					medianCheckTime: p.checkTimeStats.median,
					checkTimeStats: p.checkTimeStats,
					runs: p.runs,
					totalTime: p.metrics.totalTime,
					memoryUsed: p.metrics.memoryUsed,
					files: p.metrics.files,
					types: p.metrics.types,
					instantiations: p.metrics.instantiations,
					ratioVsFastest: 0,
				});
			}

			// Calculate ratios against fastest checkTime (using median)
			for (const key of Object.keys(cases)) {
				const fastest = Math.min(...cases[key].map((x) => x.medianCheckTime));
				cases[key] = cases[key].map((x) => ({
					...x,
					ratioVsFastest: Number((x.medianCheckTime / fastest).toFixed(2)),
				}));
			}

			// Totals per library across all cases (ranked by checkTime)
			const totalsMap = new Map<string, LibraryTotal>();

			for (const p of parsed) {
				const current = totalsMap.get(p.library) || {
					library: p.library,
					meanCheckTime: 0,
					medianCheckTime: 0,
					totalTime: 0,
					memoryUsed: 0,
					fileCount: 0,
					typeCount: 0,
					instantiationCount: 0,
				};
				totalsMap.set(p.library, {
					...current,
					meanCheckTime: current.meanCheckTime + p.checkTimeStats.mean,
					medianCheckTime: current.medianCheckTime + p.checkTimeStats.median,
					totalTime: current.totalTime + p.metrics.totalTime,
					memoryUsed: current.memoryUsed + p.metrics.memoryUsed,
					fileCount: current.fileCount + p.metrics.files,
					typeCount: current.typeCount + p.metrics.types,
					instantiationCount:
						current.instantiationCount + p.metrics.instantiations,
				});
			}

			const perLibrarySorted = Array.from(totalsMap.values()).sort(
				(a, b) => a.medianCheckTime - b.medianCheckTime,
			);

			const fastestCheckTime = perLibrarySorted[0]?.medianCheckTime ?? 1;

			// perLibrary is sorted alphabetically for consistent diffs
			const perLibrary = Array.from(totalsMap.values())
				.sort((a, b) => a.library.localeCompare(b.library))
				.map((x) => ({
					...x,
					ratioVsFastest: Number(
						(x.medianCheckTime / fastestCheckTime).toFixed(2),
					),
				}));

			// ranking is sorted by performance (checkTime)
			const ranking = perLibrarySorted.map((x) => x.library);

			const total = {
				perLibrary,
				ranking,
			};

			// Ensure deterministic ordering: sort case keys alphabetically and
			// make sure each case's library array is alphabetically ordered.
			const sortedCaseKeys = Object.keys(cases).sort((a, b) =>
				a.localeCompare(b),
			);
			const sortedCases: Record<string, (typeof cases)[string]> = {};
			for (const k of sortedCaseKeys) {
				sortedCases[k] = cases[k]
					.slice()
					.sort((a, b) => a.library.localeCompare(b.library));
			}

			const output = {
				cases: sortedCases,
				total,
				meta: {
					generatedAt: new Date().toISOString(),
					files: validResults.length,
					runsPerCase: NUM_RUNS,
					typescript: process.version,
				},
			};

			const outPath = `${root}/check-results.json`;
			yield* Effect.tryPromise(() =>
				writeFile(outPath, JSON.stringify(output, null, 2) + "\n", "utf8"),
			);
			console.log(`\n📝 Wrote type-check rankings and metrics to ${outPath}`);
		}),
	);

	async function runTypeCheck(configFile: string): Promise<DiagnosticsMetrics> {
		const rel = relative(root, configFile);

		const output = await new Promise<string>((resolve, reject) => {
			let stdout = "";
			let stderr = "";

			const child = spawn("pnpm", ["tsc", "--diagnostics", "-p", configFile], {
				stdio: ["inherit", "pipe", "pipe"],
				env: process.env,
			});

			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("exit", (code) => {
				if (code === 0 || code === null) {
					resolve(stdout);
				} else {
					reject(
						new Error(
							`Type-check failed: ${rel} (exit code ${code})\nStderr: ${stderr}`,
						),
					);
				}
			});

			child.on("error", reject);
		});

		const metrics = parseDiagnosticsOutput(output);
		if (!metrics) {
			throw new Error(`Failed to parse diagnostics output for ${rel}`);
		}

		return metrics;
	}

	async function runTypeCheckMultiple(
		configFile: string,
		numRuns: number,
	): Promise<{
		metrics: DiagnosticsMetrics;
		checkTimeStats: {
			mean: number;
			median: number;
			min: number;
			max: number;
			stdDev: number;
		};
		runs: number;
	}> {
		const rel = relative(root, configFile);
		console.log(`\n▶ Type-checking ${rel} (${numRuns} runs)`);

		const checkTimes: number[] = [];
		let firstMetrics: DiagnosticsMetrics | null = null;

		for (let i = 1; i <= numRuns; i++) {
			const metrics = await runTypeCheck(configFile);

			if (!firstMetrics) {
				firstMetrics = metrics;
			}

			checkTimes.push(metrics.checkTime);
			process.stdout.write(
				`   ✓ Run ${i}/${numRuns}: Check time ${metrics.checkTime.toFixed(3)}s\n`,
			);
		}

		const checkTimeStats = calculateStats(checkTimes);

		console.log(
			`   ✅ Mean: ${checkTimeStats.mean.toFixed(3)}s | Median: ${checkTimeStats.median.toFixed(3)}s | StdDev: ${checkTimeStats.stdDev.toFixed(4)}`,
		);
		console.log(
			`   ✓ Metrics: Instantiations=${firstMetrics!.instantiations}, Types=${firstMetrics!.types}, Files=${firstMetrics!.files}`,
		);

		return {
			metrics: firstMetrics!,
			checkTimeStats,
			runs: numRuns,
		};
	}

	console.log("\n✅ All type-checks completed");
}

runCheck().catch((err) => {
	console.error(err);
	process.exit(1);
});
