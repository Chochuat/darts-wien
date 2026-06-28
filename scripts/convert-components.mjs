import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory() && !p.includes("node_modules") && !p.includes(".next")) {
      files.push(...walk(p));
    } else if (e.isFile() && (p.endsWith(".tsx") || p.endsWith(".ts"))) {
      files.push(p);
    }
  }
  return files;
}

const files = walk("src");
let count = 0;

for (const file of files) {
  let content = readFileSync(file, "utf-8");
  const original = content;

  const re = /export default function (\w+)\s*\(/;
  const match = content.match(re);
  if (!match) continue;

  const name = match[1];
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  content = content.replace(
    new RegExp("export default function " + escaped + "\\s*\\("),
    "const " + name + " = (",
  );

  if (!content.includes("export default " + name + ";")) {
    content = content.trimEnd() + "\n\nexport default " + name + ";\n";
  }

  if (content !== original) {
    writeFileSync(file, content, "utf-8");
    console.log("Fixed:", file);
    count++;
  }
}

console.log("Converted", count, "files");
