import { Router } from "express";
import { Controller as BoardController } from '../controllers/BoardController.js'
import { SQLModel } from "@CustomTypes/db";
import { Authorization } from "../middleware/authorization.js";
import { boardAuthorization } from "../middleware/boardAuthorization.js";

export async function createBoardRouter(Model: SQLModel): Promise<Router> {
    const router = Router()
    const Controller = new BoardController(Model)
    router.use(Authorization)

    router.post('/', Controller.newBoard)
    router.patch('/:boardId', boardAuthorization, Controller.updateBoard)
    router.delete('/:boardId', boardAuthorization, Controller.deleteBoard)
    router.post('/:boardId/task', boardAuthorization, Controller.createTask)
    router.patch('/:boardId/task/:taskId', boardAuthorization, Controller.updateTask)
    router.patch('/:boardId/task/:taskId/subtask', boardAuthorization, Controller.updateSubtaskStatus)
    router.delete('/:boardId/task/:taskId', boardAuthorization, Controller.deleteTask)
    router.get('/', Controller.getBoards)
    router.get('/:boardId', boardAuthorization, Controller.getBoardById)

    return router
}