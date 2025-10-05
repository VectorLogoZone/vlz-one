#!/usr/bin/env node
/*
 * set the env vars in wrangler.json
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
    const commit = process.env.WORKERS_CI_COMMIT_SHA || "unknown";
    const lastmod = new Date().toISOString();

    const wranglerPath = path.join(__dirname, "..", "wrangler.json");
    const wranglerData = fs.readFileSync(wranglerPath, "utf-8");
    const wranglerJson = JSON.parse(wranglerData);

    wranglerJson.vars = wranglerJson.vars || {};
    wranglerJson.vars.COMMIT = commit;
    wranglerJson.vars.LASTMOD = lastmod;

    fs.writeFileSync(wranglerPath, JSON.stringify(wranglerJson, null, 2) + "\n");
    console.log(`Updated wrangler.json with COMMIT=${commit} and LASTMOD=${lastmod}`);
}

main();