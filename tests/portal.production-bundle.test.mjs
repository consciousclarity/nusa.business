import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const login = readFileSync(
  new URL("../apps/portal/src/pages/LoginPage.tsx", import.meta.url),
  "utf8",
);
const assetsDir = fileURLToPath(
  new URL("../apps/portal/dist/assets/", import.meta.url),
);

describe("portal demo login stays out of production", () => {
  it("prefills demo passwords only in Vite DEV or VITE_NUSA_DEMO_LOGIN", () => {
    assert.match(login, /import\.meta\.env\.DEV/);
    assert.match(login, /VITE_NUSA_DEMO_LOGIN/);
    assert.match(login, /owner123/);
    assert.doesNotMatch(login, /demoLoginConfig\(\) \{\s*return \{/);
  });

  it("production portal bundle does not embed demo passwords", () => {
    if (!existsSync(assetsDir)) {
      if (process.env.CI) {
        assert.fail("portal dist missing; CI must build portal before npm test");
      }
      return;
    }
    const body = readdirSync(assetsDir)
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFileSync(join(assetsDir, name), "utf8"))
      .join("\n");
    assert.doesNotMatch(body, /owner123/);
    assert.doesNotMatch(body, /admin123/);
    assert.doesNotMatch(body, /agent123/);
  });
});
