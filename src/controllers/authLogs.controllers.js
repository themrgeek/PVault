import { AuthLogs } from "../models/AuthLogs.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function getMyAuthLogs(req, res, next) {
  try {
    const logs = await AuthLogs.find({ userId: req.userId })
      .select("timestamp eventType details")
      .sort({ timestamp: -1 })
      .lean();

    res.set("Cache-Control", "no-store");
    res.status(200).json({
      logs: logs.map((log) => ({
        id: log._id.toString(),
        timestamp: log.timestamp,
        eventType: log.eventType,
        details: log.details,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyAuthLogs(req, res, next) {
  try {
    const result = await AuthLogs.deleteMany({ userId: req.userId });
    res.status(200).json({ deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
}

export async function exportMyAuthLogs(req, res, next) {
  try {
    const logs = await AuthLogs.find({ userId: req.userId })
      .select("timestamp userId eventType details -_id")
      .sort({ timestamp: 1 })
      .lean();

    const text = logs
      .map((log) =>
        JSON.stringify({
          timestamp: log.timestamp.toISOString(),
          userId: log.userId.toString(),
          eventType: log.eventType,
          details: log.details,
        }),
      )
      .join("\n");

    res.set({
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="auth-logs.txt"',
    });
    res.status(200).send(text ? `${text}\n` : "");
  } catch (error) {
    next(error);
  }
}

export async function backupMyAuthData(req, res, next) {
  try {
    const user = await User.findById(req.userId)
      .select("email createdAt updatedAt")
      .lean();
    if (!user) throw new ApiError(404, "User not found");

    const logs = await AuthLogs.find({ userId: req.userId })
      .select("timestamp userId eventType details")
      .sort({ timestamp: 1 })
      .lean();

    res.set({
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="auth-backup.json"',
    });
    res.status(200).json({
      exportedAt: new Date().toISOString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      authLogs: logs.map((log) => ({
        id: log._id.toString(),
        timestamp: log.timestamp,
        userId: log.userId.toString(),
        eventType: log.eventType,
        details: log.details,
      })),
    });
  } catch (error) {
    next(error);
  }
}
