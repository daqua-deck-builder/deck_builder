import express from 'express'
import cookieParser from 'cookie-parser';
import {api_router} from "./routes/api.js";
import {img_proxy_router} from "./routes/image_proxy.js";
import process from 'process';
import path from 'path'

const EXPRESS_ROOT = path.dirname(process.argv[1]);

const port = 3000;

const app = express();
app.locals.image_cache_dir = path.resolve(EXPRESS_ROOT, 'image_cache');
app.locals.text_cache_dir = path.resolve(EXPRESS_ROOT, 'text_cache');

app.use(express.json());
app.use(cookieParser());
app.use(express.static('../vite-project/dist'));

app.use('/g', express.static('./static/generated'));
app.use('/c', img_proxy_router);
app.use('/api', api_router);


app.listen(port, () => {
    console.log(`start listening on port ${port}`);
});