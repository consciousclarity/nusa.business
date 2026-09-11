import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const dockerfile = readFileSync(
  new URL("../apps/web/Dockerfile", import.meta.url),
  "utf8",
);

describe("web production image", () => {
  it("preserves workspace-local dependencies in the build stage", () => {
    const workspaceModules = "COPY --from=deps /app/apps/web ./apps/web";
    const sourceCopy = "COPY apps/web ./apps/web";

    assert.match(dockerfile, new RegExp(workspaceModules));
    assert.ok(
      dockerfile.indexOf(workspaceModules) < dockerfile.indexOf(sourceCopy),
      "workspace dependencies must be copied before source overlays the workspace",
    );
  });
});
