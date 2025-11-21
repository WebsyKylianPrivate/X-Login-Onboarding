// src/routes/jobs/command.ts
import { Router } from "express";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { BaseCommand, CommandState } from "./types";

const router = Router();

const SESSION_COMMANDS_QUEUE = (userId: number | string) =>
  `tma:queue:session:${userId}:commands`;

const USER_LOCK_KEY = (userId: number | string) =>
  `tma:user:${userId}:activeJob`;

const SESSION_COMMAND_STATE_KEY = (userId: number | string) =>
  `tma:session:${userId}:commandState`;

router.post("/", async (req, res) => {
  try {
    const { initData, command } = req.body || {};

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    if (!command || typeof command.type !== "string") {
      return res.status(400).json({ ok: false, error: "Invalid command" });
    }

    // 1️⃣ Vérifier initData côté backend
    const data = verifyTelegramInitData(initData);
    const userId = data.user?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing user.id in initData" });
    }

    // 2️⃣ Vérifier qu'une session est active pour ce user
    const lockKey = USER_LOCK_KEY(userId);
    const activeJobId = await redisClient.get(lockKey);

    if (!activeJobId) {
      return res.status(409).json({
        ok: false,
        error: "NO_ACTIVE_SESSION",
      });
    }

    // 3️⃣ Vérifier l'état de commande en cours
    const commandStateKey = SESSION_COMMAND_STATE_KEY(userId);
    const rawState = await redisClient.get(commandStateKey);

    if (rawState) {
      try {
        const parsed = JSON.parse(rawState) as CommandState;

        if (parsed.status === "pending" || parsed.status === "running") {
          return res.status(409).json({
            ok: false,
            error: "COMMAND_ALREADY_RUNNING",
            currentCommand: parsed,
          });
        }
      } catch (e) {
        console.error("❌ Invalid JSON in commandState:", rawState);
      }
    }

    // 4️⃣ Préparer la nouvelle commande
    const commandId =
      command.commandId ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const cmd: BaseCommand = {
      type: command.type,
      payload: command.payload ?? {},
      commandId,
    };

    const queueKey = SESSION_COMMANDS_QUEUE(userId);

    // 5️⃣ Pousser la commande dans la queue Redis du user
    await redisClient.rPush(queueKey, JSON.stringify(cmd));

    // 6️⃣ Mettre l'état de commande à "pending"
    const state: CommandState = {
      status: "pending",
      commandId,
      type: cmd.type,
      updatedAt: Date.now(),
      payload: cmd.payload ?? {},
    };

    await redisClient.set(commandStateKey, JSON.stringify(state), {
      EX: 300,
    });

    console.log("📤 Command pushed", {
      queue: queueKey,
      userId,
      cmd,
      activeJobId,
      state,
    });

    return res.json({
      ok: true,
      userId,
      jobId: activeJobId,
      commandId,
      state,
    });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/command:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
