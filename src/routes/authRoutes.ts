import { Router } from 'express'
import { SQLModel } from '@CustomTypes/db'
import { Controller as BoardController } from '../controllers/BoardController.js';
import { denieAuthRoutes } from '../middleware/denieAuthRoutes.js';

export async function createAuthRoutes(Model: SQLModel): Promise<Router> {
    const Controller = new BoardController(Model)
    const router = Router();

    router.post('/register', denieAuthRoutes, Controller.register)
    router.post('/login', denieAuthRoutes, Controller.login)

    return router;
} 