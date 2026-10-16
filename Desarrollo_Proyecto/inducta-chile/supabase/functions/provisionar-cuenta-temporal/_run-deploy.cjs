const fs = require("fs");
const path = require("path");
const argsPath = path.join(__dirname, "_deploy_invoke.json");
const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));
if (args.files?.[0]?.content?.includes("PLACEHOLDER")) {
  console.error("placeholder detected");
  process.exit(1);
}
// ponytail: stdout is the exact MCP deploy args JSON
process.stdout.write(JSON.stringify(args));
