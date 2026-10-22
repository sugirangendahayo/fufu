/**
 * Minimal structured logger.
 * Outputs JSON lines in production so log aggregators can parse them,
 * and pretty-prints in development for readability.
 */

type Level = "debug" | "info" | "warn" | "error";

const IS_PROD = process.env.NODE_ENV === "production";

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };

  const output = IS_PROD ? JSON.stringify(entry) : formatPretty(level, message, meta);

  if (level === "error" || level === "warn") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

function formatPretty(level: Level, message: string, meta?: Record<string, unknown>) {
  const colors: Record<Level, string> = {
    debug: "\x1b[36m", // cyan
    info:  "\x1b[32m", // green
    warn:  "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const dim   = "\x1b[2m";
  const ts    = new Date().toISOString();
  const tag   = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  const metaStr = meta && Object.keys(meta).length
    ? `\n  ${dim}${JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ")}${reset}`
    : "";
  return `${dim}${ts}${reset} ${tag} ${message}${metaStr}`;
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info:  (message: string, meta?: Record<string, unknown>) => log("info",  message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => log("warn",  message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
