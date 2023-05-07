import {send_request_and_cache} from "../../crawler/functions.js";
import path from "path";
import {SendRequestAndCacheOption} from "../../types/crawler.js";

const search_condition = {
    card_page: 1,
    keyword: '',
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
};

const url = 'https://www.takaratomy.co.jp/products/wixoss/card/card_list.php';
const text_cache_dir = path.resolve(path.dirname(process.argv[1]), '../..', 'text_cache');
const arg: SendRequestAndCacheOption<typeof search_condition> = {
    method: 'GET',
    endpoint: url,
    payload: search_condition,
    selector_to_pick: '.cardDip',
    referrer: '',
    url_separator: '/card/',
    text_cache_dir,
    force_update: false
};

send_request_and_cache(arg, (content: string, hit: boolean) => {
});