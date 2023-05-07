import express, {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import fs from 'node:fs';
import {procedure as fetch_product_data} from "../sample/scraping/procedure.js";

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
    const cards = await prisma.card.findMany({
        orderBy: [
            {
                slug: 'desc',
            },
        ]
    });

    console.log('publishing start');

    fs.writeFile('./static/generated/cards.json', JSON.stringify({cards}), {encoding: 'utf-8'}, () => {
        console.log('publishing complete');
        res.json({
            success: true
        });
    });
});


api_router.use('/g', express.static('../static/generated'));

api_router.post('/fetch_card_data.json', (req: Request<any, any, { product_no: string }, any>, res: Response) => {
    console.log(req.body)
    fetch_product_data(req.body.product_no, req.app.locals.text_cache_dir, false).then(() => {
        res.json({success: true});
    });
});

api_router.post('/force_update_db.json', (req: Request<any, any, { product_no: string }, any>, res: Response) => {
    console.log(req.body)
    fetch_product_data(req.body.product_no, req.app.locals.text_cache_dir, true).then(() => {
        res.json({success: true});
    });
});

export {
    api_router
}