import { Request, Response, NextFunction } from "express";
import { Owner } from "@Types/global";
import { getDb } from "../utils/db.js";
import { BoardNotFound, throwResponseError, UnauthorizedUser } from "../schema/Errors.js";



export async function boardAuthorization(req: Request, res: Response, next: NextFunction) {
    const user = req.user
    const { boardId } = req.params

    try {
        const db = await getDb()
        const [results] = await db.query<Owner[]>('SELECT BIN_TO_UUID(owner) AS owner FROM boards WHERE board_id = UUID_TO_BIN(?)', [boardId])

        if (results.length === 0) throw new BoardNotFound()

        const boardOwner = results[0].owner

        if (boardOwner !== user?.userId) throw new UnauthorizedUser("You don't have the permisions to update this board")

        next()
    } catch (error) {
        throwResponseError({ error: error as Error, res })
    }

}