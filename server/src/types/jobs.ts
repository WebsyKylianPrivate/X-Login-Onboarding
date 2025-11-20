// src/types/jobs.ts

// 👉 Statut interne du worker pour un job (valeur stockée dans Redis result.status)
export type WorkerJobStatus = "no_profile_available" | "done" | "error";

// 👉 Statut "macro" de la session que ton endpoint /jobs/status renvoie
export type SessionStatus = "idle" | "running" | "done";

// 👉 Statut de la commande (commandState.status)
export type CommandStatus = "pending" | "running" | "done" | "error";

// 👉 Type de job (extensible)
export type JobType = "BROWSER_START" | string;

// 👷 Job poussé dans la queue Redis (tma:queue:browser_start)
export interface Job {
  id: string;
  userId: number; // ou number | string si tu veux
  type: JobType;
  payload: any;
  createdAt: number; // Date.now()
}

// 📦 Résultat de job (tma:result:browser_start:{userId})
export interface JobResult {
  status: WorkerJobStatus;
  jobId: string;
  userId: number;
  profileId: string | null;
  payload: any;
  finishedAt: number;
  workerId: string;
  error?: string;
}

// 🧩 Commande de base poussée dans la queue tma:queue:session:{userId}:commands
export interface BaseCommand {
  type: string;
  payload?: any;
  commandId: string;
}

// 🧾 État de la commande (tma:session:{userId}:commandState)
export interface CommandState {
  status: CommandStatus;
  commandId: string;
  type: string;
  updatedAt: number;
  result?: any;
  error?: string;
}

// 🧮 Réponse de /api/jobs/status
export interface JobsStatusResponse {
  ok: boolean;
  status: SessionStatus;
  jobId: string | null;
  result: JobResult | null;
  commandState: CommandState | null;
}

// 🚀 Réponse de /api/jobs/start
export interface JobStartResponse {
  ok: boolean;
  jobId?: string;
  userId?: number;
  error?: "JOB_ALREADY_RUNNING" | "SERVER_ERROR" | string;
}

// 📤 Réponse de /api/jobs/command
export interface JobCommandResponse {
  ok: boolean;
  userId?: number;
  jobId?: string;
  commandId?: string;
  state?: CommandState;
  error?:
  | "NO_ACTIVE_SESSION"
  | "COMMAND_ALREADY_RUNNING"
  | "SERVER_ERROR"
  | string;
  currentCommand?: CommandState; // cas 409 COMMAND_ALREADY_RUNNING
}
