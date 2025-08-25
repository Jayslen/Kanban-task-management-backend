import z from 'zod'
import { BoardBasicInfoDTO } from '@Types/global'

export const boardSchema = z.object({
    name: z.string().min(6).max(60),
    columns: z.array(z.string().min(4).max(25))
})

export function validateBoardSchema(input: BoardBasicInfoDTO) {
    return boardSchema.safeParse(input)
}