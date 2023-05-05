import zlib from 'zlib';
import https from 'https';
import {IncomingMessage} from 'http';
import * as stream from 'stream';
import fs from 'node:fs';
import process from 'process';
import path from 'path';
import * as cheerio from 'cheerio';

const script_dir = path.dirname(process.argv[1]);

const REFERER = 'https://www.takaratomy.co.jp/products/wixoss/card/index.php';

const object_to_query_string = (obj: Object): string => {
    return Object.keys(obj)
    // @ts-ignore
        .map((key: string) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
};

const cherry_pick_html = (html: string, selector: string): string => {
    const $ = cheerio.load(html);
    const elements = $(selector);

    let extracted_html = '';

    // @ts-ignore
    elements.each((index: number, element: Document | Element | CDATA | Text | Comment | ProcessingInstruction) => {
        extracted_html += $.html(element);
    });

    return extracted_html;
};

const create_cache_filename = <T>(baseUrl: string, payload: T) => {
    // @ts-ignore
    const keys: (keyof T)[] = Object.keys(payload).sort();
    const words: string[] = [];
    let product_no: string = '-';

    for (let i = 0; i < keys.length; i++) {
        // @ts-ignore
        if (payload.hasOwnProperty(keys[i])) {
            if (keys[i] === 'product_no') {
                // @ts-ignore
                product_no = payload[keys[i]];
            } else {
                // @ts-ignore
                words.push(`${keys[i]}_${payload[keys[i]]}`);
            }
        }
    }

    return `${baseUrl.replace(/\./, '_')}/${product_no}/${words.join('__')}.html`;
};

const create_directory_if_not_exists = (file_path: string, callback: Function) => {
    const dir_path = path.dirname(file_path);
    if (!fs.existsSync(dir_path)) {
        fs.mkdirSync(dir_path, {recursive: true});
    }
    callback();
};

const send_request_anc_cache = <T>(method: string, endpoint: string, payload: T, complete: (result: string) => void) => {
    const cache_file_name = create_cache_filename(endpoint.split('/card/')[1], payload);
    const cache_file_fullpath = path.resolve(script_dir, cache_file_name);
    const cache_hit = fs.existsSync(cache_file_fullpath);
    console.log(`cache file: ${cache_file_fullpath}`)
    const fetch_process = (next: (text: string) => void) => {
        const url: URL = new URL(endpoint);

        let options!: object;

        const post_data_string: string = JSON.stringify(payload);

        if (method === 'POST') {
            options = {
                hostname: url.hostname,
                port: url.port || '443',
                path: url.pathname,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(post_data_string),

                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'ja',

                    'cache-control': 'max-age=0',
                    cookie: `wixAge=conf; `,
                    origin: 'https://www.takaratomy.co.jp',
                    referer: REFERER,
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': "Windows",
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': 1,
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
                }
            };
        } else if (method === 'GET') {
            // @ts-ignore
            const query_string: string = object_to_query_string(payload);

            options = {
                hostname: url.hostname,
                port: url.port || '443',
                path: url.pathname + (query_string ? '?' + query_string : ''),
                method,
                headers: {
                    // GETではContent-TypeとContent-Lengthは不要
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'ja',
                    'cache-control': 'max-age=0',
                    cookie: `wixAge=conf; `,
                    origin: 'https://www.takaratomy.co.jp',
                    referer: REFERER,
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': "Windows",
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': 1,
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
                }
            };
        } else {
            return;
        }

        const req = https.request(options, (res: IncomingMessage): void => {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));

            const encoding = res.headers['content-encoding'];
            let stream: stream.Readable = res;

            if (encoding === 'gzip') {
                stream = res.pipe(zlib.createGunzip());
            } else if (encoding === 'deflate') {
                stream = res.pipe(zlib.createInflate());
            }

            let dataBuffer: Uint8Array[] = [];

            stream.on('data', (chunk: Uint8Array) => {
                dataBuffer.push(chunk);
            });

            stream.on('end', () => {
                const full_data: string = Buffer.concat(dataBuffer).toString('utf-8');
                create_directory_if_not_exists(cache_file_fullpath, () => {
                    fs.writeFile(cache_file_fullpath, cherry_pick_html(full_data, '.cardDip'), 'utf-8', (err: Error | null) => {
                        if (err) throw err;
                        console.log('write');
                        next(full_data);
                    });
                })
            });
        });

        req.on('error', (e: Error): void => {
            console.error('problem with request: ' + e.message);
        });

        if (method === 'POST') {
            req.write(post_data_string);
        }
        req.end();
    }

    if (cache_hit) {
        fs.readFile(cache_file_fullpath, 'utf-8', (err: Error | null, text: string) => {
            console.log('cache hit');
            complete(text);
        });
    } else {
        console.log('cache miss');
        fetch_process(complete);
    }
};

const content = {
    card_page: 1,
    // search: 1,
    keyword: '',
    // keyword_target: 'カードNo,カード名,カードタイプ,テキスト,イラストレーター,フレーバー',
    product_type: 'booster',
    product_id: '',
    product_no: 'WXi-13',
    card_kind: '',
    card_type: '',
    rarelity: '',
    support_formats: '',
    story: '',
    level: '',
    color: '',
    ability: '',
    // tab_item: 'off'
};

const url = 'https://www.takaratomy.co.jp/products/wixoss/card/card_list.php';

send_request_anc_cache('GET', url, content, (result: String) => {
    // console.log(result);
    // console.log(true);
});