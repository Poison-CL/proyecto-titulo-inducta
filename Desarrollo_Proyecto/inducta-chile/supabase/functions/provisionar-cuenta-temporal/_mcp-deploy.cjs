// ponytail: one-shot helper — reads _deploy_invoke.json for MCP deploy args
const fs = require("fs");
const path = require("path");
const argsPath = path.join(__dirname, "_deploy_invoke.json");
const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));
if (!args.files?.[0]?.content?.includes("provisionar-cuenta-temporal")) {
  console.error("invalid index.ts in deploy args");
  process.exit(1);
}
if (!args.files?.[1]?.content?.includes("LOGO_AZUL_OSCURO_PNG_BASE64")) {
  console.error("invalid logoBase64.ts in deploy args");
  process.exit(1);
}
module.exports = args;
