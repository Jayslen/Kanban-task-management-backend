import express, { json } from 'express';
import CookieParser from 'cookie-parser'
import cors from 'cors'
import { createAuthRoutes } from './routes/authRoutes.js';
import { createBoardRouter } from './routes/boardRoutes.js';
import { MySqlModel } from './models/mysqlModel.js'
import { SERVER_PORT } from './config.js';

const app = express();

const authRoutes = await createAuthRoutes(MySqlModel)
const boardRoutes = await createBoardRouter(MySqlModel)

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(json())
app.use(CookieParser())

app.use('/board', boardRoutes)
app.use('/', authRoutes)

app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://localhost:${SERVER_PORT}`);
});