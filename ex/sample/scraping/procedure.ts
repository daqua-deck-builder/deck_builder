import * as cheerio from 'cheerio';
import {cover_condition, send_request_and_cache} from "../../crawler/functions.js";
import async from 'async';
import _ from 'underscore';

const product_no = 'WXi-11';

const procedure = (product_no: string) => {
    send_request_and_cache('GET', '', cover_condition({product_no}), '.cardDip', '', (page1: string) => {
        const $ = cheerio.load(page1);
        // @ts-ignore
        const max_page = get_max_page($('.generalPager a').map(parse_href));

        const pages = _.range(2, max_page + 1); // ここの1ページめは既にキャッシュ済みなので2から

        const funcs = pages.map((page: number) => {
            return (done: Function) => {
                send_request_and_cache('GET', '', cover_condition({
                    product_no,
                    card_page: page
                }), '.cardDip', '', (any_page_content: string, hit: boolean) => {
                    if (hit) {
                        done(null, any_page_content);
                    } else {
                        // キャッシュミスで実際にリクエストが送信されたら次を3秒待つ
                        setTimeout(() => {
                            done(null, any_page_content);
                        }, 3000);
                    }
                });
            };
        });

        // @ts-ignore
        async.series(funcs, (errors: Error[] | null, page_contents: string[]) => {
            console.log(`fetching index of [${product_no}] completed.`);

            const all_contents = [page1, ...page_contents];
            let all_links: string[] = [];

            all_contents.forEach((content) => {
                const local_links: string[] = parse_list_page_to_urls(content);
                all_links = [...all_links, ...local_links]
            });

            all_links = _.uniq(all_links);

            all_links.forEach((l) => {
                console.log(l)
            });

            console.log(`${all_links.length} items.`);
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

const parse_list_page_to_urls = (elem: string): string[] => {
// const parse_list_page_to_urls = (elem: cheerio.Element): string[] => {
    const $ = cheerio.load(elem);
    // @ts-ignore
    const links = $('a.c-box');
    const items: string[] = [];
    links.each((index, element) => {
        items.push(element.attribs.href)
    });
    return items;
};

procedure(product_no);
