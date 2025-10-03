import z from "zod";
import { boardSchema, taskBoardSchema } from "../schema/boardSchema.ts";

export type BoardBasicInfoDTO = z.infer<typeof boardSchema>;
export type BoardTask = z.infer<typeof taskBoardSchema>;

export type Subtask = {
    id: string;
    name: string;
    isComplete: boolean;
    task_id: string;
};

export type Task = {
    id: string;
    name: string | null;
    description: string | null;
    column_id: string | null;
    subtasks: Subtask[];
};

export type Column = {
    id: string;
    name: string;
    tasks: Task[];
};
