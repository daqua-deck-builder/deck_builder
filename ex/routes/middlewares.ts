import {RequestHandler, Request, Response, NextFunction} from "express";

const backup_vue_router = (prefixes: string[], main_handle: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        let hit: boolean = false;
        for (let i = 0; i < prefixes.length; i++) {
            if (req.path.startsWith(prefixes[i])) {
                hit = true;
                return main_handle(req, res, next);
            }
        }
        if (!hit) {
            next();
        }
    }
};

export {
    backup_vue_router
}