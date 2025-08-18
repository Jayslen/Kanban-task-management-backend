import { Router, Request, Response } from 'express'
import { Controller as BoardController } from '../controllers/BoardController.js';
import { SQLModel } from '@Types/global'

export async function createAuthRoutes(Model: SQLModel): Promise<Router> {
    const Controller = new BoardController(Model)
    const router = Router();

    router.post('/register', Controller.register)
    router.post('/login', Controller.login)
    router.post('/logout', (req: Request, res: Response) => { })

    return router;
} 