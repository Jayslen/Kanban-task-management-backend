import z from 'zod'
import { MySqlModel } from "../models/mysqlModel.js";
import { userSchema } from "src/schema/userSchema.js";


export type SQLModel = typeof MySqlModel
export type UserDTO = z.infer<typeof userSchema> 