import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Hello, World");
});

app.listen(HTTP_PORT, () => console.log(`Express server listening on port ${HTTP_PORT}`));
