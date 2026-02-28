const streamsByUser = new Map();

const formatSseEvent = ({ event = "notification", data }) => {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
};

export const subscribeUserStream = (userId, res) => {
  const key = String(userId);
  const set = streamsByUser.get(key) || new Set();
  set.add(res);
  streamsByUser.set(key, set);
};

export const unsubscribeUserStream = (userId, res) => {
  const key = String(userId);
  const set = streamsByUser.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) {
    streamsByUser.delete(key);
  }
};

export const publishUserEvent = (userId, payload, event = "notification") => {
  const key = String(userId);
  const set = streamsByUser.get(key);
  if (!set?.size) return;

  const formatted = formatSseEvent({ event, data: payload });
  for (const res of set) {
    try {
      res.write(formatted);
    } catch (_error) {
      // Best effort only
    }
  }
};
