import { z } from "zod";

export const emailCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
});

export type EmailCredentials = z.infer<typeof emailCredentialsSchema>;
