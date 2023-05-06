import express, {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import fs from 'node:fs';

const prisma = new PrismaClient();

const api_router = express.Router();

api_router.get('/', (req: Request, res: Response) => {
    res.json({hello: 'world'})
});

api_router.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany()
    res.json({users});
});

api_router.post('/publish_cards.json', async (req: Request, res: Response) => {
    const cards = await prisma.card.findMany();
    console.log('publishing start');

    fs.writeFile('./static/generated/cards.json', JSON.stringify({cards}), {encoding: 'utf-8'}, (a: any) => {
        console.log('publishing complete');
        console.log(a);
        res.json({
            success: true
        });
    });
});

api_router.use('/g', express.static('../static/generated'));

export {
    api_router
}