import express, {type Request, Response, NextFunction} from 'express'

const port = 3000;


const app = express();

const router = express.Router();
router.get('/', (req, res, next) => {
    res.json({hello: 'world'})
});

app.use(express.static('../vite-project/dist'));

app.use('/api', router);


app.listen(port, () => {
    console.log(`start listening on port ${port}`);
})