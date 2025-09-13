import { Router } from 'express'
import { SQLModel } from '@CustomTypes/db'
import { Controller as BoardController } from '../controllers/BoardController.js';
import { denieAuthRoutes } from '../middleware/denieAuthRoutes.js';

export async function createAuthRoutes(Model: SQLModel): Promise<Router> {
    const Controller = new BoardController(Model)
    const router = Router();

    router.use(denieAuthRoutes)

    router.post('/register', Controller.register)
    router.post('/login', Controller.login)

    return router;
} 