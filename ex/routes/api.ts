import express, {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import fs from 'node:fs';
import {procedure as fetch_product_data} from "../sample/scraping/procedure.js";
import {CardDataClient, CardDataCompact, Deck, EPS} from "../types/card.js";
import {auth_router, find_user_by_sid} from "./api_auth.js";
import {admin_router} from "./api_admin.js";
import {User} from "../types/app.js";

const prisma = new PrismaClient();

const api_router = express.Router();

api_router.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany()
    res.json({users});
});

api_router.post('/publish_cards.json', async (req: Request, res: Response) => {
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

api_router.post('/fetch_card_data.json', (req: Request<any, any, { product_no: string, product_type: string, virtual_product_no?: string }, any>, res: Response) => {
    const payload = {
        ...{
            product_no: '',
            product_type: 'booster'
        }, ...req.body
    };

    payload.virtual_product_no = req.body.virtual_product_no || '';

    console.log(payload);

    fetch_product_data(payload, req.app.locals.text_cache_dir, false).then(() => {
        res.json({success: true});
    });
});

api_router.post('/force_update_db.json', (req: Request<any, any, { product_no: string, product_type: string, virtual_product_no?: string }, any>, res: Response) => {
    const payload = {
        ...{
            product_no: '',
            product_type: 'booster'
        }, ...req.body
    };

    payload.virtual_product_no = req.body.virtual_product_no || '';

    console.log(payload);
    fetch_product_data(payload, req.app.locals.text_cache_dir, true).then(() => {
        res.json({success: true});
    });
});

api_router.post('/create_extend_parameter_setting.json', async (req: Request<any, any, { slug: string, json: string, method: string }, any>, res: Response<{ success: boolean }>) => {
    let data!: Object;
    try {
        data = JSON.parse(req.body.json);
    } catch (err) {
        if (err instanceof SyntaxError) {
            console.error('json parse error');
            res.status(503);
            res.json({success: false})
            return;
        } else {
            console.log('unknown error')
            res.status(503);
            res.json({success: false})
        }
    }

    console.log(data);
    // @ts-ignore
    const result = await prisma.ExtendParameterSetting.create({
        data: {
            method: req.body.method,
            slug: req.body.slug,
            json: req.body.json
        }
    });

    console.log(result);

    res.json({success: true});
});

api_router.post('/save_deck', (req: Request<{ deck: Deck }, any, { sid: string }>, res: Response<{ success: boolean }>, next: NextFunction): void => {
    find_user_by_sid(req.app.locals.redis_data, req.cookies.sid).then(async (login_id: string): Promise<void> => {
        const user_origin: User | null = await prisma.user.findFirst({
            where: {
                login_id
            }
        });

        if (user_origin) {
            // @ts-ignore
            const deck: Deck = {...req.body.deck};
            deck.owner = user_origin.id;

            let deck_new!: Deck;
            if (deck.id < 0) {
                // new
                deck_new = {
                    ...deck,
                    ...{id: -1}
                };
            }
            // @t-s-ignore
            await prisma.deck.upsert({
                where: {id: deck.id},
                create: deck_new,
                update: deck
            })

            res.json({
                success: true
            });
        } else {
            res.status(403);
            next(403)
        }
    }).catch(() => {
        res.status(403);
        next(403)
    });
});

api_router.use('/auth', auth_router);
api_router.use('/admin', admin_router);

export {
    api_router
}