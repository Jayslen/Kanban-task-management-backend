import { Router } from "express";
import { Controller as BoardController } from '../controllers/BoardController.js'
import { SQLModel } from "@Types/global";
import { Authorization } from "../middleware/authorization.js";
import { boardAuthorization } from "src/middleware/boardAuthorization.js";

export async function createBoardRouter(Model: SQLModel): Promise<Router> {
    const router = Router()
    const Controller = new BoardController(Model)
    router.use(Authorization)

    router.post('/', Controller.newBoard)
    router.patch('/:boardId', boardAuthorization, Controller.updateBoard)
    router.delete('/:boardId', boardAuthorization, Controller.deleteBoard)
    router.post('/:boardId/task', boardAuthorization, Controller.createTask)
    router.patch('/:boardId/task/:taskId', boardAuthorization, Controller.updateTask)
    router.delete('/:boardId/task/:taskId', boardAuthorization, Controller.deleteTask)

    return router
}