import express, { json } from 'express';
import { createAuthRoutes } from './routes/authRoutes.js';
import { MySqlModel } from './models/mysqlModel.js'
import { SERVER_PORT } from './config.js';

const app = express();

const authRoutes = await createAuthRoutes(MySqlModel)

app.use(json())
app.use(authRoutes)

app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://localhost:${SERVER_PORT}`);
});