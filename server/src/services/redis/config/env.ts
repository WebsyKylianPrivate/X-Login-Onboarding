// Lazy configuration that reads from process.env each time it's accessed
// This ensures dotenv.config() has been called before reading values
export const config = {
  get host() {
    return process.env.REDIS_HOST || "localhost";
  },
  get port() {
    return Number(process.env.REDIS_PORT) || 6379;
  },
  get password() {
    return process.env.REDIS_PASSWORD;
  },
  get db() {
    return Number(process.env.REDIS_DB) || 0;
  },
};

