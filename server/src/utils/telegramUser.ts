// src/utils/telegramUser.ts

export type TelegramUserPublic = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  language_code: string | null;
};

export function extractTelegramUserInfo(data: any): TelegramUserPublic | null {
  if (!data || !data.user) return null;

  const u = data.user;

  return {
    id: u.id,
    first_name: u.first_name ?? null,
    last_name: u.last_name ?? null,
    username: u.username ?? null,
    language_code: u.language_code ?? null,
  };
}
