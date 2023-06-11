import * as cheerio from 'cheerio';
import {cover_condition, send_request_and_cache, send_request_and_cache_card_detail} from "../../crawler/functions.js";
import async from 'async';
import _ from 'underscore';
import {parse_modern_structure} from "../card_page/parse_card_html.js";
import {CardData} from "../../types/card.js";
import {insert_card_if_new, update_card} from "./store.js";
import {SendRequestAndCacheOption} from "../../types/crawler.js";

type SearchCondition = {}

const procedure = async (search_condition: Partial<SearchCondition> & {
    product_no: string,
    sort: number
}, text_cache_dir: string, force_update: boolean): Promise<void> => {

    // 製品で検索した結果を調査する
    return new Promise<void>((resolve, reject): void => {
        const arg: SendRequestAndCacheOption<any> = {
            method: 'GET',
            endpoint: '',
            payload: cover_condition(search_condition),
            selector_to_pick: '.cardDip',
            referrer: '',
            url_separator: '/card/',
            text_cache_dir,
            force_update
        };

        send_request_and_cache(arg, (page1: string, hit: boolean): void => {
            // 検索結果1ページめ
            const $: cheerio.CheerioAPI = cheerio.load(page1);

            // @ts-ignore
            const items_amount: number = Number($('h3:first span').text().match(/(\d+)/)[0]);
            const items_per_page: number = 3 * 7;

            const max_page: number = Math.ceil(items_amount / items_per_page);

            // 製品に何ページ分の検索結果があるか
            const pages: number[] = _.range(2, max_page + 1); // ここの1ページめは既にキャッシュ済みなので2から

            const funcs = pages.map((page: number) => {
                return (done: Function): void => {
                    const arg: SendRequestAndCacheOption<any> = {
                        method: 'GET',
                        endpoint: '',
                        payload: cover_condition({
                            ...search_condition,
                            ...{card_page: page}
                        }),
                        selector_to_pick: '.cardDip',
                        referrer: '',
                        url_separator: '/card/',
                        text_cache_dir,
                        force_update: false
                    };

                    // Nページめに含まれるリンク一覧を取得する
                    send_request_and_cache(arg, (any_page_content: string, hit: boolean): void => {
                        if (hit) {
                            done(null, any_page_content);
                        } else {
                            // キャッシュミスで実際にリクエストが送信されたら次を3秒待つ
                            setTimeout((): void => {
                                done(null, any_page_content);
                            }, 3000);
                        }
                    });
                };
            });

            // @ts-ignore
            async.series(funcs, (errors: Error[] | null, any_page_content: string[]): void => {
                console.log(`fetching index of [${search_condition.product_no}] completed.`);

                const all_contents: string[] = [page1, ...any_page_content];
                let all_links: string[] = [];

                all_contents.forEach((content: string): void => {
                    const local_links: string[] = parse_list_page_to_urls(content);
                    all_links = [...all_links, ...local_links];
                });

                all_links = _.uniq(all_links);  // カード詳細への全リンク

                console.log(`${all_links.length} items found.`);

                // 個々のカードの情報をダウンロードする
                const funcs: Function[] = all_links.map((detail_link: string, index: number): Function => {
                    return (done: (err: Error | null, result: boolean) => void): void => {
                        const url: URL = new URL(detail_link);
                        const payload: Record<string, string> = search_params_to_object(url.searchParams);
                        const card_sort: number = search_condition.sort - index; // 製品内ではリストの先頭の方のカードが上に並ぶようにする

                        const arg: SendRequestAndCacheOption<typeof payload> = {
                            method: 'GET',
                            endpoint: url.origin + url.pathname,
                            payload,
                            selector_to_pick: '.cardDetail',
                            referrer: '',
                            url_separator: '/products/wixoss/',
                            text_cache_dir,
                            force_update
                        };

                        send_request_and_cache_card_detail(arg, (content: string, hit: boolean): void => {
                            try {
                                const cd: CardData | false = parse_modern_structure(cheerio.load(content));
                                if (cd) {
                                    cd.sort = card_sort;
                                    cd.product = search_condition.product_no;

                                    if (force_update) {
                                        update_card(cd).then((): void => {
                                            if (hit) {
                                                done(null, true);
                                            } else {
                                                setTimeout((): void => {
                                                    done(null, true);
                                                }, 3000);
                                            }
                                        });
                                    } else {
                                        insert_card_if_new(cd).then((): void => {
                                            if (hit) {
                                                done(null, true);
                                            } else {
                                                setTimeout((): void => {
                                                    done(null, true);
                                                }, 3000);
                                            }
                                        });
                                    }
                                } else {
                                    done(null, true);
                                }
                            } catch (e) {
                                console.error(e);
                                // @ts-ignore
                                done(payload.card_no, false);
                            }
                        });
                    }
                });

                // @ts-ignore
                async.series(funcs, (errors: Error[] | null, results: boolean[]): void => {
                    console.log(`${search_condition.product_no} ${results.length} items cached.`);
                    if (errors) {
                        reject(errors);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
};

const search_params_to_object = (searchParams: URLSearchParams): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (let [key, value] of searchParams.entries()) {
        obj[key] = value;
    }
    return obj;
};

const parse_list_page_to_urls = (elem: string): string[] => {
    const $: cheerio.CheerioAPI = cheerio.load(elem);
    const links: cheerio.Cheerio<cheerio.Element> = $('a.c-box');
    const items: string[] = [];
    links.each((index: number, element: cheerio.Element): void => {
        items.push(element.attribs.href);
    });
    return items;
};

// const product_no = 'WX-05';
// procedure(product_no);

export {procedure}