const fs = require("fs");
const path = require("path");
const base = __dirname;
const args = {
  project_id: "fuzxwjctcqnuhnctluyg",
  name: "provisionar-cuenta-temporal",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [
    { name: "index.ts", content: fs.readFileSync(path.join(base, "index.ts"), "utf8") },
    { name: "logoBase64.ts", content: fs.readFileSync(path.join(base, "logoBase64.ts"), "utf8") },
  ],
};
const out = path.join(base, "_deploy_invoke.json");
fs.writeFileSync(out, JSON.stringify(args));
console.log(JSON.stringify({ out, bytes: fs.statSync(out).size, indexLen: args.files[0].content.length, logoLen: args.files[1].content.length }));
