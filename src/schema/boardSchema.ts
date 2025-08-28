import z from 'zod'
import { BoardBasicInfoDTO } from '@Types/global'

export const boardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.array(z.string().min(4).max(25))
})

export const columnsBoardSchema = z.object({
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

export function validateBoardSchema(input: BoardBasicInfoDTO) {
    return boardSchema.safeParse(input)
}

export function validateBoardColumnsSchema(input: unknown) {
    return columnsBoardSchema.safeParse(input)
}