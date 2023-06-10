import express, {NextFunction, Request, Response, Router} from 'express';
import {type User} from "../types/app.js";
import bcrypt from 'bcrypt';
import {PrismaClient} from "@prisma/client";
import redis from 'ioredis';
import {type LoginInfo} from "../types/app.js";

const prisma: PrismaClient = new PrismaClient();

const auth_router: Router = express.Router();

const create_default_user = (): Omit<User, 'id'> => {
    const now: Date = new Date();
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
        const hashedPassword: string = await bcrypt.hash(password, 10);
        const new_user: Omit<User, 'id'> = {...create_default_user(), ...{name, login_id, password: hashedPassword}};
        resolve(new_user);
    });
};

const auth_check = async (info: LoginInfo): Promise<User> => {
    return new Promise<User>(async (resolve, reject): Promise<void> => {
        const {login_id, password}: { login_id: string, password: string } = info;
        const user: User | null = await prisma.user.findUnique({
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

const make_user_logging_in = async (redis_data: redis.Redis, user: User, res: Response<{
    success: boolean,
    reason?: string,
    user?: User
}>): Promise<void> => {
    const sid: string = generate_random();
    const expires: number = 86400000;

    // @ts-ignore
    redis_data.set(`/sid:${sid}`, user.login_id, 'ex', expires).then((): void => {
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
                    sameSite: 'lax'
                });
            res.json({
                success: true,
                reason: '',
                user: user
            });
        });
    });
};

const validate_create_user_info = ({login_id, password, password_confirm, name}: {
    login_id: string,
    password: string,
    password_confirm: string,
    name: string
}): string[] => {
    const drop_invalid_letter = (input: string): boolean => {
        const strippedInput: string = input.replace(/[^a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]/g, '');
        return strippedInput === input;
    };
    const errors: string[] = [];

    if (!drop_invalid_letter(login_id)) {
        errors.push('ログインIDに使用できない文字が含まれています。');
    }

    if (login_id.length < 6) {
        errors.push('ログインIDは最少6文字で設定してください。');
    } else if (login_id.length > 128) {
        errors.push('ログインIDは最大128文字で設定してください。');
    }

    if (password !== password_confirm) {
        errors.push('確認用パスワードが一致していません。')
    } else if (password.length < 6) {
        errors.push('パスワードは最少6文字で設定してください。');
    } else if (password.length > 128) {
        errors.push('パスワードは最大128文字で設定してください。');
    } else if (!drop_invalid_letter(password)) {
        errors.push('パスワードに使用できない文字列が含まれています。');
    }

    if (name.length > 16) {
        errors.push('ユーザー名は最大16文字で設定してください。');
    } else if (name.length < 1) {
        errors.push('ユーザー名は最少1文字で設定してください。');
    }

    return errors;
};

auth_router.post('/create_user', async (req: Request<{
    name: string,
    login_id: string,
    password: string,
    password_confirm: string,
}>, res: Response<{ success: boolean, reason?: string, user?: User }>): Promise<void> => {
    // todo: すでにログインしている場合は警告を出して弾く

    const {name, login_id, password, password_confirm} = req.body;

    // todo: ログインIDが既に存在する場合は弾く

    const errors: string[] = validate_create_user_info({login_id, password, password_confirm, name});

    if (errors.length > 0) {
        res.status(400);
        res.json({
            success: false,
            reason: errors.join('\n')
        });
    } else {
        const login_id_used: User | null = await prisma.user.findFirst({
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
            const created_user: User = await prisma.user.create({data: user});
            make_user_logging_in(req.app.locals.redis_data, created_user, res).then();
        }
    }
});

auth_router.post('/login', (req: Request<{ login_id: string, password: string }>, res: Response<{
    success: boolean,
    reason?: string,
    user?: User
}>): void => {
    auth_check(req.body).then((user: User): void => {
        req.app.locals.redis_data.del(`/sid:${req.cookies.sid}`).then((): void => {   // セッションIDを携えてきたらそちらはログアウト
            make_user_logging_in(req.app.locals.redis_data, user, res).then();
        });
    }).catch((): void => {
        res.json({success: false, reason: ''});
    });
});

auth_router.post('/logout', (req: Request<any, any, { sid: string }>, res: Response): void => {
    req.app.locals.redis_data.del(`/sid:${req.cookies.sid}`).then((): void => {
        res.send('');
    });
});

const check_is_admin = (req: Request<any, any, { sid: string }, any>, res: Response, next: NextFunction): void => {
    find_user_by_sid(req.app.locals.redis_data, req.cookies.sid).then(async (login_id: string): Promise<void> => {
        const user_origin: User | null = await prisma.user.findFirst({
            where: {
                login_id
            }
        });
        if (user_origin && user_origin.is_admin) {
            next();
        } else {
            res.status(403);
            next(403)
        }
    }).catch((): void => {
        res.status(403);
        next(403)
    });
};

const check_is_admin_json = (req: Request<any, any, { sid: string }, any>, res: Response, next: NextFunction): void => {
    find_user_by_sid(req.app.locals.redis_data, req.cookies.sid).then(async (login_id: string): Promise<void> => {
        const user_origin: User | null = await prisma.user.findFirst({
            where: {
                login_id
            }
        });
        if (user_origin && user_origin.is_admin) {
            next();
        } else {
            res.status(403);
            res.json({success: false});
        }
    }).catch((): void => {
        res.status(403);
        res.json({success: false});
    });
};

auth_router.get('/', (req: Request<any, any, { sid: string }, any>, res: Response<{
    name: string,
    login_id: string,
    is_admin: boolean
}>): void => {
    find_user_by_sid(req.app.locals.redis_data, req.cookies.sid).then(async (login_id: string): Promise<void> => {
        const user_origin: User | null = await prisma.user.findFirst({
            where: {
                login_id
            }
        });
        if (user_origin) {
            res.json({name: user_origin.name, login_id: login_id, is_admin: user_origin.is_admin});
        } else {
            res.json({name: '', login_id: '', is_admin: false});
        }
    }).catch((): void => {
        res.json({name: '', login_id: '', is_admin: false});
    });
});

export {
    auth_router,
    check_is_admin,
    check_is_admin_json,
    find_user_by_sid
}