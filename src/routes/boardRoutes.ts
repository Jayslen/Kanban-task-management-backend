import { Router } from "express";
import { Controller as BoardController } from '../controllers/BoardController.js'
import { SQLModel } from "@Types/global";
import { Authorization } from "../middleware/authorization.js";

export async function createBoardRouter(Model: SQLModel): Promise<Router> {
    const router = Router()
    const Controller = new BoardController(Model)
    router.use(Authorization)

    router.post('/', Controller.newBoard)

    return router
}