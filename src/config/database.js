export function getPostgresConnectionString() {
  const host = process.env.POSTGRES_HOST || "localhost";
  const port = process.env.POSTGRES_PORT || "5432";
  const database = process.env.POSTGRES_DATABASE;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (!database) {
    throw new Error("POSTGRES_DATABASE is not configured");
  }

  if (!user) {
    throw new Error("POSTGRES_USER is not configured");
  }

  if (!password) {
    throw new Error("POSTGRES_PASSWORD is not configured");
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port}/${database}`;
}