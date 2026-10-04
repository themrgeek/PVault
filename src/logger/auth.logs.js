import { AuthLogs } from "../models/AuthLogs.js";

const safeReasons = new Set([
  "invalid_credentials",
  "too_many_failed_attempts",
  "user_initiated",
  "administrator_action",
]);

export async function logAuthEvent({ userId = null, eventType, req, reason }) {
  const details = {};
  if (req?.ip) details.ipAddress = req.ip;
  if (safeReasons.has(reason)) details.reason = reason;

  try {
    await AuthLogs.create({ userId, eventType, details });
  } catch {
    console.error("Failed to persist authentication audit event");
  }
}
