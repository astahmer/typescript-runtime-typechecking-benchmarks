import { spawn } from "node:child_process";
import { dirname, relative } from "node:path";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Duration, Effect } from "effect";
import fg from "fast-glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
	const root = dirname(__dirname);
	const pattern = "cases/**/case.attest.ts";
	const entries = await fg(pattern, { cwd: root, absolute: true });

	if (entries.length === 0) {
		console.error(
			"No cases found. Create files matching 'cases/**/case.attest.ts'.",
		);
		process.exit(1);
	}

	await Effect.runPromise(
		Effect.gen(function* () {
			const results = yield* Effect.all(
				entries.map((file) =>
					Effect.tryPromise(() => runCase(file).then(() => file)).pipe(
						Effect.timed,
						Effect.map(([duration, file]) => ({ duration, file })),
					),
				),
			);
			// Build rich, pretty, and machine-usable JSON output
			const parsed = results.map(({ duration, file }) => {
				const rel = relative(root, file);
				const parts = rel.split("/");
				const library = parts[1];
				const testCase = parts[2];
				const ms = Duration.toMillis(duration);
				const human = Duration.format(duration);
				return { rel, library, testCase, ms, human };
			});

			// Group by case and sort libraries by ascending time
			const cases: Record<
				string,
				Array<{
					library: string;
					ms: number;
					human: string;
					ratioVsFastest: number;
				}>
			> = {};
			for (const p of parsed) {
				(cases[p.testCase] ||= []).push({
					library: p.library,
					ms: p.ms,
					human: p.human,
					ratioVsFastest: 0,
				});
			}
			for (const key of Object.keys(cases)) {
				cases[key].sort((a, b) => a.ms - b.ms);
				const fastestMs = cases[key][0]?.ms ?? 1;
				cases[key] = cases[key].map((x) => ({
					...x,
					ratioVsFastest: Number((x.ms / fastestMs).toFixed(2)),
				}));
			}

			// Totals per library across all cases
			const totalsMap = new Map<string, number>();
			for (const p of parsed) {
				totalsMap.set(p.library, (totalsMap.get(p.library) || 0) + p.ms);
			}
			const perLibrary = Array.from(totalsMap.entries())
				.map(([library, totalMs]) => ({
					library,
					totalMs,
					totalHuman:
						totalMs >= 1000
							? `${(totalMs / 1000).toFixed(2)} s`
							: `${totalMs.toFixed(2)} ms`,
				}))
				.sort((a, b) => a.totalMs - b.totalMs);
			const fastestTotal = perLibrary[0]?.totalMs ?? 1;
			const total = {
				perLibrary: perLibrary.map((x) => ({
					...x,
					ratioVsFastest: Number((x.totalMs / fastestTotal).toFixed(2)),
				})),
				ranking: perLibrary.map((x) => x.library),
			};

			const output = {
				cases,
				total,
				meta: {
					generatedAt: new Date().toISOString(),
					files: results.length,
					node: process.version,
				},
			};

			const outPath = `${root}/run-results.json`;
			yield* Effect.tryPromise(() =>
				writeFile(outPath, JSON.stringify(output, null, 2) + "\n", "utf8"),
			);
			console.log(`\n📝 Wrote case rankings and totals to ${outPath}`);
		}),
	);

	async function runCase(file: string) {
		const rel = relative(root, file);
		console.log(`\n▶ Running ${rel}`);
		await new Promise<void>((resolve, reject) => {
			const child = spawn(
				"node",
				[
					..."--no-warnings=ExperimentalWarning --experimental-strip-types --experimental-transform-types".split(
						" ",
					),
					file,
				],
				{
					stdio: "inherit",
					env: process.env,
				},
			);
			child.on("exit", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`${rel} exited with code ${code}`));
			});
			child.on("error", reject);
		});
	}
	console.log("\n✅ All cases completed");
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
