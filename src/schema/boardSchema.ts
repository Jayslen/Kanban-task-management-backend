import z from 'zod'

export const boardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.array(z.string().min(4).max(25))
})

export const updateColumnsBoardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.array(z.object({
        id: z.string().optional(),
        // remove: z.boolean().optional(),
        name: z.string().min(4).max(25).optional()
    })).optional(),
})

export const taskBoardSchema = z.object({
    name: z.string().min(6).max(40),
    description: z.string().min(8).max(150).optional(),
    subtasks: z.array(z.string().min(6).max(40)),
    status: z.string()
})

export const updateBoardTaskSchema = z.object({
    name: z.string().min(6).max(40).optional(),
    description: z.string().min(8).max(150).optional(),
    subtasks: z.array(z.object({ name: z.string().min(6).max(40).optional(), id: z.string().optional() })).optional(),
    status: z.string().optional()
})

export const updateSubtaskStatusSchema = z.object({
    subtaskId: z.string(),
    isCompleted: z.boolean()
})

export function validateBoardSchema(input: unknown) {
    return boardSchema.safeParse(input)
}

export function validateBoardColumnsSchema(input: unknown) {
    return updateColumnsBoardSchema.safeParse(input)
}

export function validateTaskBoard(input: unknown) {
    return taskBoardSchema.safeParse(input)
}

export function validateBoardTaskUpdateSchema(input: unknown) {
    return updateBoardTaskSchema.safeParse(input)
}

export function validateSubtaskStatusSchema(input: unknown) {
    return updateSubtaskStatusSchema.safeParse(input)
}