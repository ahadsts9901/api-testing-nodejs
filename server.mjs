import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import cors from 'cors';
import "./mongodb.mjs"

import unAuthenticatedAuthRouter from './v1-routes/un-auth-routes/auth.mjs'

import cookieParser from 'cookie-parser'
import { errorCodes } from './core.mjs';
import { mockToken } from './testAuth.mjs';

const app = express();
app.use(express.json()); // body parser
app.use(cookieParser()); // cookie parser
app.use(
    cors({
        origin: 'http://localhost:3000', // allow to server to accept request from different origin
        credentials: true,
    })
);

// un-authenticated routes goes here
app.use("/api/v1", unAuthenticatedAuthRouter)

app.use("/api/v1", (req, res, next) => {

    const hart = req.cookies?.hart ?? mockToken;

    try {

        const currentUser = jwt.verify(hart, process.env.SECRET);

        req.currentUser = {
            ...currentUser
        };

        next();

    } catch (err) {
        console.error(err);
        res.status(401).send({
            message: "unauthorized",
            errorCode: errorCodes.UNAUTHORIZED
        });
        return;
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})

export default app;