import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);

describe("CI workflow", () => {
  it("gates PRs with build, test, and seed — and does not auto-deploy", () => {
    assert.match(workflow, /npm run build:packages/);
    assert.match(workflow, /npm run build -w @nusa\/api/);
    assert.match(workflow, /npm run build -w @nusa\/portal/);
    assert.match(workflow, /npm run build -w @nusa\/web/);
    assert.match(workflow, /npm test/);
    assert.match(workflow, /npm run seed/);

    assert.doesNotMatch(workflow, /^ {2}deploy:/m);
    assert.doesNotMatch(workflow, /\brsync\b/);
    assert.doesNotMatch(workflow, /\/var\/www\/nusa\.business/);
    assert.doesNotMatch(workflow, /secrets\.VPS_/);
    assert.doesNotMatch(workflow, /VPS_SSH_KEY/);
  });
});
