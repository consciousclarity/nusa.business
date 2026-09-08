import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  renameSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { dirname } from "node:path";

/**
 * Crash-safe file replace for the JSON data store.
 *
 * Direct `writeFileSync(store.json)` can leave a truncated file if the process
 * dies mid-write. We write a sibling temp file, fsync it, keep a `.bak` of the
 * previous good bytes, then `rename` into place (atomic on the same filesystem).
 */

export function backupPathFor(targetPath: string): string {
  return `${targetPath}.bak`;
}

export function atomicWriteFile(
  targetPath: string,
  contents: string,
  opts: { rotateBackup?: boolean } = {},
): void {
  const rotateBackup = opts.rotateBackup !== false;
  const dir = dirname(targetPath);
  mkdirSync(dir, { recursive: true });

  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  const fd = openSync(tmpPath, "w");
  try {
    writeSync(fd, contents, undefined, "utf8");
    fsyncSync(fd);
  } catch (err) {
    try {
      closeSync(fd);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }
  closeSync(fd);

  try {
    if (rotateBackup && existsSync(targetPath)) {
      // Best-effort last-known-good copy for parse failures after a bad write.
      copyFileSync(targetPath, backupPathFor(targetPath));
    }
    renameSync(tmpPath, targetPath);
  } catch (err) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }

  // Durability of the directory entry (rename) on filesystems that need it.
  try {
    const dirFd = openSync(dir, "r");
    try {
      fsyncSync(dirFd);
    } finally {
      closeSync(dirFd);
    }
  } catch {
    // Some environments disallow opening directories read-only; the file fsync +
    // rename already cover the common single-host Docker volume case.
  }
}
