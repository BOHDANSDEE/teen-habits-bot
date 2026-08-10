const sessions = new Map();

function createEmptySession() {
  return {
    subthemeKey: null,
    levelKey: null,
    previousSubthemeKey: null,
    continuationCount: 0
  };
}

export function resetSession(chatId) {
  const session = createEmptySession();
  sessions.set(String(chatId), session);
  return session;
}

export function getSession(chatId) {
  const key = String(chatId);

  if (!sessions.has(key)) {
    sessions.set(key, createEmptySession());
  }

  return sessions.get(key);
}

export function chooseLevel(chatId, subthemeKey, levelKey) {
  const session = getSession(chatId);
  session.previousSubthemeKey = null;
  session.subthemeKey = subthemeKey;
  session.levelKey = levelKey;
  session.continuationCount = 0;
  return session;
}

export function continueWith(chatId, nextSubthemeKey, nextLevelKey) {
  const session = getSession(chatId);
  session.previousSubthemeKey = session.subthemeKey;
  session.subthemeKey = nextSubthemeKey;
  session.levelKey = nextLevelKey;
  session.continuationCount += 1;
  return session;
}
