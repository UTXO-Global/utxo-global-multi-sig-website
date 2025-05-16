import fs from "fs";
import path from "path";
import { format } from "date-fns";

const OUT_DIR = path.resolve("out");
const VERSION = `${format(new Date(), "yyyyMMddHHmmss")}`;

function replaceJsVersionInHTML(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const updated = content.replace(
    /src="(\/[^"]+\.js)(\?[^"]*)?"/g,
    (_, filePath, query = "") => {
      let newQuery;
      if (query && query.includes("v=")) {
        newQuery = query.replace(/v=\d+/g, `v=${VERSION}`);
      } else if (query) {
        newQuery = `${query}&v=${VERSION}`;
      } else {
        newQuery = `?v=${VERSION}`;
      }

      return `src="${filePath}${newQuery}"`;
    }
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

function replaceJsVersionInOutDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceJsVersionInOutDir(fullPath);
    } else if (file.endsWith(".html")) {
      replaceJsVersionInHTML(fullPath);
    }
  }
}

replaceJsVersionInOutDir(OUT_DIR);
