import * as cheerio from 'cheerio';
import {cover_condition, send_request_and_cache} from "../../crawler/functions.js";
import async from 'async';
import _ from 'underscore';

const product_no = 'WXi-12';

const procedure = () => {
    send_request_and_cache('GET', '', cover_condition({product_no}), '.cardDip', '', (page1: string) => {
        const $ = cheerio.load(page1);
        // @ts-ignore
        const max_page = get_max_page($('.generalPager a').map(parse_href));

        const pages = _.range(1, max_page + 1);

        const funcs = pages.map((page: number) => {
            return (done: Function) => {
                send_request_and_cache('GET', '', cover_condition({
                    product_no,
                    card_page: page
                }), '.cardDip', '', (any_page_content: string, hit: boolean) => {
                    if (hit) {
                        done(null, true);
                    } else {
                        // キャッシュミスで実際にリクエストが送信されたら次を3秒待つ
                        setTimeout(() => {
                            done(null, true);
                        }, 3000);
                    }
                });
            };
        });

        // @ts-ignore
        async.series(funcs, (errors: Error[] | null, results: boolean[]) => {
            console.log(`fetching index of [${product_no}] completed.`);
        });
    });
};

const parse_href = (index: number, elem: cheerio.Element): Record<string, string> => {
    let o: Record<string, string> = {};
    // @ts-ignore
    (elem.attribs.href || '').replace(/^\?/, '').split('&').forEach(fragment => {
        const [key, value] = fragment.split('=');
        o[key] = value || '';
    });
    return o;
};

const get_max_page = (items: Record<string, string>[]) => {
    let max_page = 1;

    // @ts-ignore
    items.each((index: number, item: cheerio.Element & { card_page: string }) => {
        if (item.card_page) {
            max_page = Math.max(Number(item.card_page), max_page);
        }
    });

    return max_page;
};

procedure();
