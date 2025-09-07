import z from "zod";
import { userSchema } from "../schema/userSchema.ts";

export type UserDTO = z.infer<typeof userSchema>;
export type UserParams = { username: string; password: string };
