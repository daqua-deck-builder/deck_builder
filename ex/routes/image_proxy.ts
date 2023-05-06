import express, {Request} from "express";
import https from 'https';
import fs from 'node:fs';
import path from 'path';

const img_proxy_router = express.Router();

const proxy_download = (url: string, local_filepath: string, next: (success: boolean) => void) => {
    const cache_dir: string = path.dirname(local_filepath);
    fs.mkdir(cache_dir, {recursive: true}, err => {
        if (err) {
            console.log(err);
            next(false);
        } else {
            const request = () => {
                https.get(url, (response) => {
                    if (response.statusCode !== 200) {
                        console.error(url);
                        console.error(`Failed to download image. Status Code: ${response.statusCode}`);
                        response.resume();
                        next(false);
                        return;
                    }

                    const file = fs.createWriteStream(local_filepath);
                    response.pipe(file);

                    file.on('finish', () => {
                        file.close(() => {
                            console.log(`Image successfully downloaded to ${local_filepath}`);
                            next(true);
                        });
                    });

                    file.on('error', (error) => {
                        fs.unlink(local_filepath, () => {
                        }); // 途中で失敗した場合、部分的にダウンロードされたファイルを削除します
                        console.error(`Failed to save image: ${error.message}`);
                        next(false);
                    });
                }).on('error', (error) => {
                    console.error(`Failed to download image: ${error.message}`);
                    next(false);
                });
            };
            request();
        }
    });
};

const create_official_image_path = (product_no: string, filename_official: string): string => {
    // WXDi-Pxx-xxx.jpg
    return `https://www.takaratomy.co.jp/products/wixoss/img/card/${product_no}/${filename_official}`;
};

const split_wx_format = (path_original: string): { name: string, sub_path: string } => {
    const tokens: string[] = path_original.split('-');
    const name: string = tokens.pop() || '';
    const sub_path: string = tokens.join('/');

    if (name === '') {
        throw`image file name error: ${path_original}`;
    }

    return {
        name, sub_path
    };
};

img_proxy_router.get('/:dir/:img_file', (req: Request<{ dir: string, img_file: string }>, res) => {
    const cache_dir: string = req.app.locals.image_cache_dir;
    const {dir, img_file} = req.params;
    const {name, sub_path} = split_wx_format(img_file);

    const cache_file_name = path.resolve(cache_dir, req.params.dir, sub_path, name);
    const official_file_url = create_official_image_path(dir, img_file);
    // console.log({dir, official_file_url, cache_file_name})

    fs.stat(cache_file_name, {}, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
        if (err && err.code === 'ENOENT') {
            console.log('cache miss');

            // todo: そもそもキャッシュ済みのカード(WXDi...)としてDBに登録されているかをチェックする

            proxy_download(official_file_url, cache_file_name, (success: boolean) => {
                if (success) {
                    fs.readFile(cache_file_name, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                        // todo: ブラウザにもキャッシュを依頼するヘッダを付与する
                        res.writeHead(200, {'Content-Type': 'image/jpeg'});
                        res.end(data, 'binary');
                    });
                } else {
                    res.status(503);
                    res.send('image not found');
                }
            });
        } else {
            console.log('cache hit');
            fs.readFile(cache_file_name, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data, 'binary');
            });
        }
    });
});

export {img_proxy_router}