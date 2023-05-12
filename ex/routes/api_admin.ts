import express, {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import {CardData, CardDataClient, EPS} from "../types/card.js";

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

    // @ts-ignore
    const epss: EPS[] = await prisma.ExtendParameterSetting.findMany({
        where: {
            slug
        }
    });

    if (card_detail) {
        res.json({card: card_detail, epss});
    } else {
        next(404);
    }
});

admin_router.post('/update_eps', (req: Request<{ eps: EPS }>, res) => {
    const data = req.body.eps;
    const data_id_removed = {...data};
    delete data_id_removed.id

    // @ts-ignore
    prisma.ExtendParameterSetting.upsert({
        where: {id: data.id},
        create: data_id_removed,
        update: data
    }).then(() => {
        prisma.ExtendParameterSetting.findMany({
            where: {slug: data.slug}
        }).then((epss: EPS[]) => {
            res.json({epss});
        });
    });
});


export {admin_router}