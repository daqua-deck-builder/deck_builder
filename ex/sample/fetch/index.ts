import zlib from 'zlib';
import https from 'https';
import {IncomingMessage} from 'http';
import * as stream from 'stream';
import fs from 'node:fs';
import process from 'process';
import path from 'path';

const script_dir = path.dirname(process.argv[1]);

const REFERER = 'https://www.takaratomy.co.jp/products/wixoss/card/index.php';
const url = 'https://www.takaratomy.co.jp/products/wixoss/card/card_list.php';

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

    return `${baseUrl.replace(/\./, '_')}/${product_no}/${words.join('__')}.txt`;
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
    console.log({cache_file_fullpath})
    const fetch_process = (next: (text: string) => void) => {
        const url: URL = new URL(endpoint);

        const post_data_string: string = JSON.stringify(payload);

        const options = {
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
                // cookie: `wixAge=conf; _td_ssc_id=01G4T2EF136AY2KJ95F1XX930Z; _gcl_au=1.1.2125809834.1682430316; __pp_uid=vFhA1MN8yJ1Ue1fsZcFM4LXLaVVoS9Gh; _fbp=fb.2.1682430317259.846733912; _gid=GA1.3.1173989969.1683165997; PHPSESSID=81q41q9a1v9r4hv249cgb1bfil; _gat=1; _ga_QYYHLZZDGR=GS1.1.1683272068.24.1.1683272132.60.0.0; _td=2e9a9431-df0e-4522-ae81-da066f07e5e6; _gat_UA-41451305-1=1; _ga_NKBQEML43B=GS1.1.1683272068.24.1.1683272132.60.0.0; _ga=GA1.1.99177972.1682430317`,
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
                    fs.writeFile(cache_file_fullpath, full_data, 'utf-8', (err: Error | null) => {
                        if (err) throw err;
                        console.log('write')
                        next(full_data);
                    });
                })
            });
        });

        req.on('error', (e: Error): void => {
            console.error('problem with request: ' + e.message);
        });

        req.write(post_data_string);
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
    search: 1,
    keyword: '',
    keyword_target: [],
    // keyword_target: ['カードNo', 'カード名', 'カードタイプ', 'テキスト', 'イラストレーター', 'フレーバー'],
    product_type: 'booster',
    product_no: 'WXi-13',
    card_kind: '',
    card_type: '',
    rarelity: '',
    tab_item: 'off'
};

send_request_anc_cache('POST', url, content, (result: String) => {
    // console.log(result);
    // console.log(true);
});