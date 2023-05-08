import express, {Request, Response} from 'express';

const auth_router = express.Router();

type User = {
    id: string,
    name: string
}

type LoginInfo = {
    login_id: string,
    password: string
}

const auth_check = (info: LoginInfo, next: (user: User | null) => void) => {
    const {login_id, password} = info;
    if (login_id === 'user1' && password === 'password') {
        next({
            id: 'user1',
            name: 'Taro'
        });
    } else {
        next(null);
    }
}

const find_user_by_sid = (sid: string) => {
    let user_id: string = '';
    const keys: string[] = Object.keys(session);
    for (let i: number = 0; i < keys.length; i++) {
        if (keys[i] === sid) {
            user_id = session[sid];
            break;
        }
    }
    return user_id;
}

const session: Record<string, string> = {};
const generate_random = () => {
    return `${Math.random()}`;
}

auth_router.post('/login', (req: Request<{ login_id: string, password: string }>, res: Response<{ username: string }>): void => {
    console.log(req.body);
    auth_check(req.body, (user: any) => {
        console.log(user);
        if (!user) {
            res.json({username: ""});
        } else {
            const sid = generate_random();
            session[sid] = user.id;
            res.cookie(
                "sid", sid,
                {
                    maxAge: 86400000,
                    httpOnly: true, // クッキーへのクライアントサイドのJavaScriptアクセスを防ぐ
                    secure: false, // HTTPSを必要とするかどうか
                });
            res.json({username: user.id});
        }
    });
});

auth_router.post('/logout', (req: Request<any, any, { sid: string }>, res: Response): void => {
    delete session[req.cookies.sid];
    res.send('');
});

auth_router.get('/', (req: Request<any, any, { sid: string }, any>, res: Response<{ username: string }>) => {
    const user_id = find_user_by_sid(req.cookies.sid);
    console.log(user_id)
    if (user_id) {
        res.json({username: user_id});
    } else {
        res.json({username: ''});
    }
});

export {auth_router}