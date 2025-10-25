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
			// Write per-file duration results to a JSON map at the repo root
			const map = Object.fromEntries(
				results.map(({ duration, file }) => [
					relative(root, file),
					{
						duration: Duration.format(duration),
						ms: Duration.toMillis(duration),
					},
				]),
			);
			const outPath = `${root}/run-results.json`;
			yield* Effect.tryPromise(() =>
				writeFile(outPath, JSON.stringify(map, null, 2) + "\n", "utf8"),
			);
			console.log(`\n📝 Wrote per-file durations to ${outPath}`);
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
