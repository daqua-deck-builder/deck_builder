import {send_request_and_cache} from "../../crawler/functions.js";

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

send_request_and_cache('GET', url, search_condition, '.cardDip', '', '/card/', (content: string, hit: boolean) => {
});