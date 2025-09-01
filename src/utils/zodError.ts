import z from 'zod'

export function formatZodError(zodError: z.ZodError) {
    return Object.entries(z.flattenError(zodError).fieldErrors)
}