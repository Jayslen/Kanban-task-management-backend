import z from 'zod'

export const boardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.array(z.string().min(4).max(25))
})

export const updateColumnsBoardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.object({
        edit: z.array(z.object({
            id: z.number("Some column id is missing"),
            remove: z.boolean().optional(),
            payload: z.string().optional(),
            name: z.string().min(4).max(25).optional()
        })).optional().default([]),
        add: z.array(z.string().min(4).max(25)).optional().default([])
    })
})

export const taskBoardSchema = z.object({
    name: z.string().min(6).max(40),
    description: z.string().min(8).max(150).optional(),
    subtasks: z.array(z.string().min(6).max(40)),
    status: z.number()
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