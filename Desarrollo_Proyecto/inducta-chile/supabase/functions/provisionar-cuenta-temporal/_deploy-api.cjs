const fs = require("fs");
const path = require("path");

const args = JSON.parse(
  fs.readFileSync("C:/Users/Mateo/AppData/Local/Temp/deploy-stdout.json", "utf8"),
);

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error("NO_TOKEN");
    process.exit(2);
  }
  const meta = {
    name: args.name,
    entrypoint_path: args.entrypoint_path,
    verify_jwt: args.verify_jwt,
  };
  const form = new FormData();
  form.append("metadata", JSON.stringify(meta));
  for (const f of args.files) {
    form.append("file", new Blob([f.content], { type: "application/typescript" }), f.name);
  }
  const url = `https://api.supabase.com/v1/projects/${args.project_id}/functions/deploy`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  console.log(res.status, text.slice(0, 500));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
