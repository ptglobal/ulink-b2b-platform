declare module '../../../directus/lib/smtp.mjs' {
  export function sendMail(
    message: { from?: string; to: string; subject: string; text: string },
    env?: NodeJS.ProcessEnv
  ): Promise<void>;
}
