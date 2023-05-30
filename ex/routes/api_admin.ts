import express, {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import {CardDataClient, EPS} from "../types/card.js";
import {Product} from "../types/app.js";
import {procedure as fetch_product_data} from "../sample/scraping/procedure.js";
import fs from "node:fs";

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
        // @ts-ignore
        prisma.ExtendParameterSetting.findMany({
            where: {slug: data.slug}
        }).then((epss: EPS[]) => {
            res.json({epss});
        });
    });
});

admin_router.get('/products', async (req: Request, res: Response<{ products: Product[] }>) => {
    // @ts-ignore
    const products: Product[] | null = await prisma["product"].findMany({});

    if (products) {
        res.json({
            products
        });
    } else {
        res.json({products: []});
    }
});

admin_router.post('/update_product', async (req, res) => {
    const product: Product = {...req.body["product"]};
    const new_product = (() => {
        const p: Product = {...product};
        // @ts-ignore
        delete p.id;
        delete p.last_converted;
        delete p.last_fetched;
        return p;
    })();
    await prisma["product"].upsert({
        where: {
            id: product.id
        },
        update: product,
        create: new_product
    });
    res.json({success: true});
});

admin_router.post('/fetch_items', async (req: Request<{ id: number }>, res) => {
    // @ts-ignore
    const product: Product | null = await prisma["product"].findFirst({
        where: {
            id: req.body.id
        }
    });

    if (product) {
        const payload = {
            product_no: product.product_no,
            product_type: product.product_type,
            virtual_product_no: ''
        };

        // payload.virtual_product_no = req.body.virtual_product_no || '';

        console.log(payload);

        fetch_product_data(payload, req.app.locals.text_cache_dir, false).then(async () => {
            await prisma["product"].update({
                where: {id: req.body.id},
                data: {
                    last_fetched: new Date()
                }
            });
            res.json({success: true});
        });
    } else {
        res.json({success: false});
    }

})

admin_router.post('/publish_cards', async (req: Request, res: Response) => {
    // @ts-ignore
    const cards: CardDataClient[] = await prisma.card.findMany({
        orderBy: [
            {
                slug: 'desc',
            },
        ]
    });

    // @ts-ignore
    const ep_settings: EPS[] = await prisma.ExtendParameterSetting.findMany();

    console.log('publishing start');

    const cards_modified: CardDataClient[] = cards.map((c: CardDataClient) => {
        for (let i = 0; i < ep_settings.length; i++) {
            if (ep_settings[i].slug === c.slug) {
                if (ep_settings[i].method === 'extend') {
                    c = {...c, ...JSON.parse(ep_settings[i].json)};
                    console.log(`extend setting applied. slug: ${c.slug} data: ${ep_settings[i].json} `);
                }
            }
        }
        return c;
    });

    fs.writeFile('./static/generated/cards.json', JSON.stringify({cards: cards_modified}), {encoding: 'utf-8'}, () => {
        console.log('publishing complete');
        res.json({
            success: true
        });
    });
});

export {admin_router}