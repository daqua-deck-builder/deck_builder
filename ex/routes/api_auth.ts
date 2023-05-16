import express, {NextFunction, Request, Response} from 'express';
import {type User} from "../types/app.js";
import bcrypt from 'bcrypt';
import {PrismaClient} from "@prisma/client";
import redis from 'ioredis';
import {type LoginInfo} from "../types/app.js";

const prisma = new PrismaClient();

const auth_router = express.Router();

const create_default_user = (): Omit<User, 'id'> => {
    const now = new Date();
    return {
        name: 'your name',
        login_id: '',
        password: "*********",
        theme: "default",
        last_login: now,
        created_at: now,
        is_admin: false,
        use_allstar: false,
        use_key_selection: false
    };
};

const create_user = async ({
                               name,
                               login_id,
                               password
                           }: { name: string, login_id: string, password: string }): Promise<Omit<User, 'id'>> => {
    return new Promise<Omit<User, 'id'>>(async (resolve): Promise<any> => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const new_user: Omit<User, 'id'> = {...create_default_user(), ...{name, login_id, password: hashedPassword}};
        resolve(new_user);
    });
}

const auth_check = async (info: LoginInfo): Promise<User> => {
    return new Promise<User>(async (resolve, reject): Promise<void> => {
        const {login_id, password} = info;
        const user = await prisma.user.findUnique({
            where: {login_id},
        });

        if (!user) {
            reject();
            return;
        }

        // パスワードを比較
        const isMatch: boolean = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            reject();
        } else {
            resolve(user);
        }
    });
}

const find_user_by_sid = (redis: redis.Redis, sid: string): Promise<string> => {
    return new Promise<string>((resolve, reject): void => {
        redis.get(`/sid:${sid}`).then((login_id: string | null): void => {
            if (login_id) {
                resolve(login_id);
            } else {
                reject();
            }
        });
    });
};

const generate_random = (): string => {
    return `${Math.random()}`;
};

auth_router.post('/create_user', async (req: Request<{ name: string, login_id: string, password: string }>, res: Response<{ success: boolean, reason?: string, user?: User }>): Promise<void> => {
    const {name, login_id, password} = req.body;

    const login_id_used = await prisma.user.findFirst({
        where: {
            login_id
        }
    });

    if (login_id_used) {
        res.json({
            success: false,
            reason: 'login_id_is_used'
        });
    } else {
        const user: Omit<User, 'id'> = await create_user({name, login_id, password});
        const created_user = await prisma.user.create({data: user});
        res.json({
            success: true,
            user: created_user
        });
    }
});

auth_router.post('/login', (req: Request<{ login_id: string, password: string }>, res: Response<{ username: string, login_id: string, is_admin: boolean }>): void => {
    auth_check(req.body).then((user: User): void => {
        req.app.locals.redis_data.del(`/sid:${req.cookies.sid}`).then(() => {   // セッションIDを携えてきたらそちらはログアウト

            const sid = generate_random();
            const expires = 86400000;
            req.app.locals.redis_data.set(`/sid:${sid}`, user.login_id, 'ex', expires).then((): void => {
                prisma.user.update({
                    where: {
                        login_id: user.login_id
                    },
                    data: {
                        last_login: new Date()
                    }
                }).then((): void => {
                    res.cookie(
                        "sid", sid,
                        {
                            maxAge: expires,
                            httpOnly: true, // クッキーへのクライアントサイドのJavaScriptアクセスを防ぐ
                            secure: false, // HTTPSを必要とするかどうか
                        });
                    res.json({username: user.name, login_id: user.login_id, is_admin: user.is_admin});
                });
            });
        });
    }).catch((): void => {
        res.json({username: '', login_id: "", is_admin: false});
    });
});

auth_router.post('/logout', (req: Request<any, any, { sid: string }>, res: Response): void => {
    req.app.locals.redis_data.del(`/sid:${req.cookies.sid}`).then(() => {
        res.send('');
    });
});

const check_is_admin = (req: Request<any, any, { sid: string }, any>, res: Response, next: NextFunction) => {

};

auth_router.get('/', (req: Request<any, any, { sid: string }, any>, res: Response<{ username: string, login_id: string, is_admin: boolean }>): void => {
    find_user_by_sid(req.app.locals.redis_data, req.cookies.sid).then(async (login_id: string): Promise<void> => {
        const user_origin: User | null = await prisma.user.findFirst({
            where: {
                login_id
            }
        });
        if (user_origin) {
            res.json({username: user_origin.name, login_id: login_id, is_admin: user_origin.is_admin});
        } else {
            res.json({username: '', login_id: '', is_admin: false});
        }
    }).catch(() => {
        res.json({username: '', login_id: '', is_admin: false});
    });
});

export {auth_router, check_is_admin, find_user_by_sid}