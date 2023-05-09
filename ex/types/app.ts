type Env = {
    // app
    IMAGE_CACHE_DIR?: string,
    TEXT_CACHE_DIR?: string,

    // prisma
    DATABASE_URL: string
}

type User = {
    login_id: string,
    id: number,
    name: string,
    password: string,
    theme: string,
    last_login: Date,
    created_at: Date,
    is_admin: boolean,
    use_allstar: boolean,
    use_key_selection: boolean
}

type LoginInfo = {
    login_id: string,
    password: string
}

export type {
    Env,
    User,
    LoginInfo
}
