import fs from "node:fs";
import path from "node:path";

function clone(value) {
  return value == null ? value : structuredClone(value);
}

export function createMemoryStores() {
  const records = new Map();
  const blobs = new Map();
  return {
    records: {
      async get(key) {
        return records.has(key) ? clone(records.get(key)) : null;
      },
      async set(key, value) {
        records.set(key, clone(value));
      },
      async delete(key) {
        records.delete(key);
      },
      async list(prefix) {
        const out = [];
        for (const [key, value] of records) {
          if (key.startsWith(prefix)) out.push({ key, value: clone(value) });
        }
        return out;
      },
    },
    blobs: {
      async put(key, bytes, meta = {}) {
        blobs.set(key, { bytes: Buffer.from(bytes), meta: { ...meta } });
      },
      async get(key) {
        const found = blobs.get(key);
        return found ? { bytes: Buffer.from(found.bytes), meta: { ...found.meta } } : null;
      },
      async delete(key) {
        blobs.delete(key);
      },
      async list(prefix) {
        return [...blobs.keys()].filter((key) => key.startsWith(prefix));
      },
    },
  };
}

export function createFileStores(dir) {
  const root = path.resolve(dir);
  const recordFile = path.join(root, "records.json");
  const blobDir = path.join(root, "blobs");
  fs.mkdirSync(blobDir, { recursive: true });
  let queue = Promise.resolve();

  function lock(fn) {
    const run = queue.then(fn, fn);
    queue = run.then(() => {}, () => {});
    return run;
  }

  function readAll() {
    if (!fs.existsSync(recordFile)) return {};
    return JSON.parse(fs.readFileSync(recordFile, "utf8"));
  }

  function writeAll(data) {
    fs.writeFileSync(recordFile, JSON.stringify(data));
  }

  function blobPath(key) {
    return path.join(blobDir, Buffer.from(key).toString("hex"));
  }

  function readIndex() {
    const indexFile = path.join(blobDir, "index.json");
    if (!fs.existsSync(indexFile)) return [];
    return JSON.parse(fs.readFileSync(indexFile, "utf8"));
  }

  function writeIndex(keys) {
    fs.writeFileSync(path.join(blobDir, "index.json"), JSON.stringify(keys));
  }

  return {
    records: {
      async get(key) {
        return lock(() => {
          const all = readAll();
          return all[key] ? clone(all[key]) : null;
        });
      },
      async set(key, value) {
        return lock(() => {
          const all = readAll();
          all[key] = clone(value);
          writeAll(all);
        });
      },
      async delete(key) {
        return lock(() => {
          const all = readAll();
          delete all[key];
          writeAll(all);
        });
      },
      async list(prefix) {
        return lock(() => {
          const all = readAll();
          return Object.entries(all)
            .filter(([key]) => key.startsWith(prefix))
            .map(([key, value]) => ({ key, value: clone(value) }));
        });
      },
    },
    blobs: {
      async put(key, bytes, meta = {}) {
        return lock(() => {
          fs.writeFileSync(blobPath(key), Buffer.from(bytes));
          fs.writeFileSync(`${blobPath(key)}.json`, JSON.stringify(meta));
          const keys = new Set(readIndex());
          keys.add(key);
          writeIndex([...keys]);
        });
      },
      async get(key) {
        return lock(() => {
          const file = blobPath(key);
          if (!fs.existsSync(file)) return null;
          const meta = fs.existsSync(`${file}.json`) ? JSON.parse(fs.readFileSync(`${file}.json`, "utf8")) : {};
          return { bytes: fs.readFileSync(file), meta };
        });
      },
      async delete(key) {
        return lock(() => {
          const file = blobPath(key);
          if (fs.existsSync(file)) fs.unlinkSync(file);
          if (fs.existsSync(`${file}.json`)) fs.unlinkSync(`${file}.json`);
          writeIndex(readIndex().filter((item) => item !== key));
        });
      },
      async list(prefix) {
        return lock(() => readIndex().filter((key) => key.startsWith(prefix)));
      },
    },
  };
}
