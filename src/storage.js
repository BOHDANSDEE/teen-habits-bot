import fs from "fs";
import path from "path";

const RUNTIME_DIR = path.join(process.cwd(), "runtime");
const USERS_FILE = path.join(RUNTIME_DIR, "users.json");
const STATS_FILE = path.join(RUNTIME_DIR, "stats.json");

function cloneFallback(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return cloneFallback(fallback);
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return cloneFallback(fallback);
    return JSON.parse(raw);
  } catch (error) {
    console.error(`❌ readJson ${path.basename(filePath)}:`, error.message);
    return cloneFallback(fallback);
  }
}

function writeJson(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`❌ writeJson ${path.basename(filePath)}:`, error.message);
  }
}

export function getUser(chatId) {
  const users = readJson(USERS_FILE, {});
  const key = String(chatId);

  if (!users[key]) {
    users[key] = {
      chatId: key,
      currentThemeKey: null,
      currentLevelKey: null,
      resultsShown: 0,
      continuationsShown: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    writeJson(USERS_FILE, users);
  }

  return users[key];
}

export function updateUser(chatId, patch) {
  const users = readJson(USERS_FILE, {});
  const key = String(chatId);
  const current = users[key] || getUser(chatId);

  users[key] = {
    ...current,
    ...patch,
    lastSeen: new Date().toISOString()
  };
  writeJson(USERS_FILE, users);
  return users[key];
}

export function registerEvent(type, chatId, extra = {}) {
  const stats = readJson(STATS_FILE, {
    starts: 0,
    results: 0,
    continuations: 0,
    events: []
  });

  if (type === "start") stats.starts += 1;
  if (type === "result") stats.results += 1;
  if (type === "continuation") stats.continuations += 1;

  stats.events.push({
    type,
    chatId: String(chatId),
    time: new Date().toISOString(),
    ...extra
  });
  stats.events = stats.events.slice(-300);
  writeJson(STATS_FILE, stats);
}

export function getStats() {
  return readJson(STATS_FILE, {
    starts: 0,
    results: 0,
    continuations: 0,
    events: []
  });
}
