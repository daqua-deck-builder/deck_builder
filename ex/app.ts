import express, {type Request, Response} from 'express'
import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient();

const port = 3000;

const app = express();

const router = express.Router();
router.get('/', (req: Request, res: Response) => {
    res.json({hello: 'world'})
});

router.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany()
    res.json({users});
});

app.use(express.static('../vite-project/dist'));

app.use('/api', router);


app.listen(port, () => {
    console.log(`start listening on port ${port}`);
})