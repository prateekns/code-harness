function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info(message, metadata = {}) {
    console.log(
      `[${timestamp()}] [INFO] ${message}`,
      metadata
    );
  },

  warn(message, metadata = {}) {
    console.warn(
      `[${timestamp()}] [WARN] ${message}`,
      metadata
    );
  },

  error(message, metadata = {}) {
    console.error(
      `[${timestamp()}] [ERROR] ${message}`,
      metadata
    );
  },
};