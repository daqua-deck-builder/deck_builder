import express, {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import {CardData, CardDataClient} from "../types/card.js";

const prisma = new PrismaClient();

const admin_router = express.Router();

admin_router.get('/card_detail/:slug', async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<any> => {
    const slug: string = req.params.slug;
    // @ts-ignore
    const card_detail: CardDataClient | null = await prisma.card.findFirst({
        where: {
            slug
        }
    });


    if (card_detail) {
        res.json({card: card_detail});
    } else {
        next(404);
    }
});


export {admin_router}