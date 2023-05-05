import {CardData, CardDataCompact} from "../types/card.js";
import {CARD_TYPE, COMMON_WORD} from "../constants.js";

const COLOR_PAIR = [
    ['白', 'w'],
    ['青', 'u'],
    ['黒', 'k'],
    ['赤', 'r'],
    ['緑', 'g'],
    ['無', 'l']
];

const CARDTYPE_PAIR = [
    ['シグニ', 'sg'],
    ['スペル', 'sp'],
    ['ルリグ', 'lr'],
    ['アーツ', 'ar'],
    ['キー', 'ky'],
    ['ピース', 'pi'],
    ['レゾナ', 're'],
    ['アシストルリグ', 'al'],
    ['アーツ（クラフト）', 'ac'],
    ['レゾナ（クラフト）', 'rc'],
];

const LRIG_TEAM_NAME_PAIR = [
    ['タマ', 'tam'],
    ['タウィル', 'taw'],
    ['リメンバ', 'rem'],
    ['サシェ', 'sas'],
    ['ドーナ', 'don'],
    ['エマ', 'ema'],
    ['リゼ', 'riz'],
    ['アンジュ', 'anj'],
    ['アキノ', 'akn'],
    ['LION', 'lio'],
    ['ノヴァ', 'nov'],
    ['ゆかゆか', 'yuk'],
    ['花代', 'hny'],
    ['ユヅキ', 'ydk'],
    ['リル', 'ril'],
    ['カーニバル', 'cnv'],
    ['レイラ', 'rla'],
    ['ＬｏＶ', 'lov'],
    ['ヒラナ', 'hrn'],
    ['LOVIT', 'lvt'],
    ['エクス', 'ex'],
    ['ピルルク', 'prk'],
    ['エルドラ', 'eld'],
    ['ミルルン', 'mil'],
    ['あや', 'aya'],
    ['レイ', 'rei'],
    ['タマゴ', 'tmg'],
    ['マドカ', 'mdk'],
    ['みこみこ', 'mik'],
    ['緑子', 'mdr'],
    ['アン', 'ann'],
    ['アイヤイ', 'ayy'],
    ['メル', 'mel'],
    ['ママ', 'mam'],
    ['アト', 'ato'],
    ['WOLF', 'wlf'],
    ['バン', 'ban'],
    ['サンガ', 'sng'],
    ['ウリス', 'urt'],
    ['イオナ', 'ion'],
    ['ウムル', 'umr'],
    ['ミュウ', 'myu'],
    ['アルフォウ', 'alf'],
    ['ハナレ', 'hnr'],
    ['ナナシ', 'nns'],
    ['グズ子', 'gzk'],
    ['とこ', 'tok'],
    ['ムジカ', 'mzk'],
    ['デウス', 'des'],
    ['マキナ', 'mac'],
    ['まほまほ', 'mah'],
    ['美兎', 'mit'],
    ['夢限', 'mug'],
    ['？', 'may'],
    ['にじさんじ', 'nij'],

    ['＜アンシエント･サプライズ＞', 'ansp'],
    ['＜Card Jockey＞', 'cjky'],
    ['＜No Limit＞', 'nlmt'],
    ['＜DIAGRAM＞', 'dgrm'],
    ['＜デウス・エクス・マキナ＞', 'dxma'],
    ['＜うちゅうのはじまり＞', 'uhjm'],
    ['＜さんばか＞', 'snbk'],
    ['＜きゅるきゅるーん☆＞', 'crcr'],
    [COMMON_WORD.DREAM_TEAM, 'drtm'],
    [COMMON_WORD.NO_TEAM, 'fret']
];

const color_source = new Map();
const cardtype_source = new Map();
const lrig_name_source = new Map();

for (let i = 0; i < COLOR_PAIR.length; i++) {
    color_source.set(COLOR_PAIR[i][0], COLOR_PAIR[i][1]);
    color_source.set(COLOR_PAIR[i][1], COLOR_PAIR[i][0]);
}

for (let i = 0; i < CARDTYPE_PAIR.length; i++) {
    cardtype_source.set(CARDTYPE_PAIR[i][0], CARDTYPE_PAIR[i][1]);
    cardtype_source.set(CARDTYPE_PAIR[i][1], CARDTYPE_PAIR[i][0]);
}

for (let i = 0; i < LRIG_TEAM_NAME_PAIR.length; i++) {
    lrig_name_source.set(LRIG_TEAM_NAME_PAIR[i][0], LRIG_TEAM_NAME_PAIR[i][1]);
    lrig_name_source.set(LRIG_TEAM_NAME_PAIR[i][1], LRIG_TEAM_NAME_PAIR[i][0]);
}

const compact_color = (s: string) => {
    return color_source.get(s) || COMMON_WORD.UNKNOWN_COLOR;
};

const compact_cardtype = (s: string) => {
    return cardtype_source.get(s) || CARD_TYPE.UNKNOWN_CARD_TYPE;
};

const compact_lrig_team = (s: string) => {
    return lrig_name_source.get(s) || COMMON_WORD.UNKNOWN_LRIG_TEAM;
};

const compact_lrig_team_multi = (ss: string[]) => {
    return ss.map(compact_lrig_team);
};

const compact_img = (path: string, slug: string) => {
    return path.split(slug).join('@');
};

const expand_img = (path: string, slug: string) => {
    return path.split('@').join(slug);
};

const trim_img_path = (img: string) => {
    return img.split('/card/')[1];
};

const trim_color_brace = (cost: string) => {
    return cost.replace(/[《》]/g, '');
};

const convert_power = (power: string): string => {
    if (power.indexOf('000') > -1) {
        return power.replace(/000/, 'k');
    } else if (power.indexOf('k') > -1) {
        return power.replace(/k/, '000');
    } else {
        return power;
    }
};

const compact = (d: CardData): CardDataCompact => {
    return {
        s: d.slug,
        n: d.name,
        p: d.pronounce,
        i: compact_img(d.img, d.slug),
        t: compact_cardtype(d.card_type),
        lr: d.lrig,
        lv: d.level,
        c: d.color.map(compact_color),
        cl: d.klass,
        cs: d.cost.map(trim_color_brace),   // カッコを外す処理は一方通行
        l: d.limit,
        pw: convert_power(d.power),
        tm: compact_lrig_team_multi(d.team),
        tp: d.team_piece,
        ti: d.timing,
        r: d.rarity,
        b: d.has_lb,
        bt: d.lb_text,
        sk: d.skills,
        st: d.story,
        fm: d.format
    };
};

const expand = (c: CardDataCompact): CardData => {
    return {
        slug: c.s,
        name: c.n,
        pronounce: c.p,
        img: expand_img(c.i, c.s),   // @
        card_type: compact_cardtype(c.t),
        lrig: c.lr,
        level: c.lv,
        color: c.c.map(compact_color),
        klass: c.cl,
        cost: c.cs, // なにもしない
        limit: c.l,
        power: convert_power(c.pw),
        team: compact_lrig_team_multi(c.tm),
        team_piece: c.tp,
        timing: c.ti,
        rarity: c.r,
        has_lb: c.b,
        lb_text: c.bt,
        skills: c.sk,
        story: c.st,
        format: c.fm
    };
};
const cleanup_skill_text_line = (t: string): string => {
    return t
        .replace(/　/g, ' ')
        .replace(/アイコン/g, '')
        .replace(/（.*）/ig, '')
        .replace(/\n/ig, '')
        .trim();
};

const drop_no_value = (items: string[]) => {
    return items.filter(i => i !== '');
};

const erase_no_value = (item: string) => {
    return item === '-' ? '' : item;
};

export {
    compact,
    trim_img_path,
    compact_img,
    trim_color_brace,
    compact_color,
    compact_cardtype,
    compact_lrig_team,
    compact_lrig_team_multi,
    cleanup_skill_text_line,
    drop_no_value,
    erase_no_value,
    convert_power
};


