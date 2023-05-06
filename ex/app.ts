import express from 'express'
import {api_router} from "./routes/index.js";

const port = 3000;

const app = express();

app.use(express.static('../vite-project/dist'));
app.use('/g', express.static('./static/generated'));

app.use('/api', api_router);


app.listen(port, () => {
    console.log(`start listening on port ${port}`);
});