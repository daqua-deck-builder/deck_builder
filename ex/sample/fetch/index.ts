import {send_request_and_cache} from "../../crawler/functions.js";
import path from "path";

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

send_request_and_cache('GET', url, search_condition, '.cardDip', '', '/card/', text_cache_dir, (content: string, hit: boolean) => {
});