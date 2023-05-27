import express, {Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import {api_router} from "./routes/api.js";
import {check_is_admin} from "./routes/api_auth.js";
import {img_proxy_router} from "./routes/image_proxy.js";
import process from 'process';
import path from 'path';
import dotenv from 'dotenv';
import type {Env} from "./types/app.js";
import Redis from 'ioredis';
import fs from 'node:fs';
import ErrnoException = NodeJS.ErrnoException;
import {backup_vue_router} from "./routes/middlewares.js";

// @ts-ignore
const {TEXT_CACHE_DIR, IMAGE_CACHE_DIR, DATABASE_URL}: Env = dotenv.config().parsed;

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.');
    process.exit(1);
}

const EXPRESS_ROOT = path.dirname(process.argv[1]);

// @ts-ignore
const redis_data = new Redis();

const app = express();
app.locals.image_cache_dir = IMAGE_CACHE_DIR || path.resolve(EXPRESS_ROOT, 'image_cache');
app.locals.text_cache_dir = TEXT_CACHE_DIR || path.resolve(EXPRESS_ROOT, 'text_cache');
app.locals.redis_data = redis_data;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('../vite-project/dist'));

let static_index_content: string | null;
app.use(backup_vue_router(['/admin', '/card'], (req: Request, res: Response): void => {
    if (static_index_content) {
        res.send(static_index_content);
    } else {
        fs.readFile('../vite-project/dist/index.html', (err: ErrnoException | null, buffer: Buffer): void => {
            if (err) {
                console.error(err);
                res.status(500).send("Server error");
                static_index_content = null;
            } else {
                static_index_content = buffer.toString();
                res.send(static_index_content);
            }
        });
    }
}));

app.use('/generated', express.static('./static/generated'));
app.use('/image', check_is_admin, img_proxy_router);
app.use('/api', api_router);


const port = 3000;

app.listen(port, (): void => {
    console.log(`start listening on port ${port}`);
});