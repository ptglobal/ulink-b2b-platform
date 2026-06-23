export function sendMail(
  message: { from?: string; to: string; subject: string; text: string; html?: string | null },
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>
): Promise<void>;
