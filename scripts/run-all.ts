import fg from "fast-glob"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, relative } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function run() {
  const root = dirname(__dirname)
  const pattern = "cases/**/case.attest.ts"
  const entries = await fg(pattern, { cwd: root, absolute: true })

  if (entries.length === 0) {
    console.error("No cases found. Create files matching 'cases/**/case.attest.ts'.")
    process.exit(1)
  }

  for (const file of entries) {
    const rel = relative(root, file)
    console.log(`\n▶ Running ${rel}`)
    await new Promise<void>((resolve, reject) => {
        const child = spawn("node", [..."--no-warnings=ExperimentalWarning --experimental-strip-types --experimental-transform-types".split(" "), file], {
        stdio: "inherit",
        env: process.env,
      })
      child.on("exit", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`${rel} exited with code ${code}`))
      })
      child.on("error", reject)
    })
  }
  console.log("\n✅ All cases completed")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
