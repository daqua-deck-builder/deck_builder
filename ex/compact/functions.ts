import {CardData, CardDataCompact} from "../types/card.js";
import {CARD_TYPE, COMMON_WORD, LRIG_TYPE, TEAM_TYPE} from "../constants.js";

const COLOR_PAIR = [
    ['白', 'w'],
    ['青', 'u'],
    ['黒', 'k'],
    ['赤', 'r'],
    ['緑', 'g'],
    ['無', 'l']
];

const CARDTYPE_PAIR = [
    [CARD_TYPE.SIGNI, 'sg'],
    [CARD_TYPE.SPELL, 'sp'],
    [CARD_TYPE.LRIG, 'lr'],
    [CARD_TYPE.ARTS, 'ar'],
    [CARD_TYPE.KEY, 'ky'],
    [CARD_TYPE.PIECE, 'pi'],
    [CARD_TYPE.PIECE_RELAY, 'rp'],
    [CARD_TYPE.RESONA, 're'],
    [CARD_TYPE.ASSIST, 'al'],
    [CARD_TYPE.ARTS_CRAFT, 'ac'],
    [CARD_TYPE.RESONA_CRAFT, 'rc'],
];

const LRIG_TEAM_NAME_PAIR = [
    [LRIG_TYPE.TAMA, 'tam'],
    [LRIG_TYPE.TAWIL, 'taw'],
    [LRIG_TYPE.REMEMBA, 'rem'],
    [LRIG_TYPE.SASHE, 'sas'],
    [LRIG_TYPE.DONA, 'don'],
    [LRIG_TYPE.EMMA, 'ema'],
    [LRIG_TYPE.RIZE, 'riz'],
    [LRIG_TYPE.ANJU, 'anj'],
    [LRIG_TYPE.AKINO, 'akn'],
    [LRIG_TYPE.LION, 'lio'],
    [LRIG_TYPE.NOVA, 'nov'],
    [LRIG_TYPE.YUKAYUKA, 'yuk'],
    [LRIG_TYPE.HANAYO, 'hny'],
    [LRIG_TYPE.YUZUKI, 'ydk'],
    [LRIG_TYPE.RIL, 'ril'],
    [LRIG_TYPE.CARNIVAL, 'cnv'],
    [LRIG_TYPE.REILA, 'rla'],
    [LRIG_TYPE.LOV, 'lov'],
    [LRIG_TYPE.HIRANA, 'hrn'],
    [LRIG_TYPE.LOVIT, 'lvt'],
    [LRIG_TYPE.EX, 'ex'],
    [LRIG_TYPE.PIRURUKU, 'prk'],
    [LRIG_TYPE.ELDORA, 'eld'],
    [LRIG_TYPE.MIRURUN, 'mil'],
    [LRIG_TYPE.AYA, 'aya'],
    [LRIG_TYPE.REI, 'rei'],
    [LRIG_TYPE.TAMAGO, 'tmg'],
    [LRIG_TYPE.MADOKA, 'mdk'],
    [LRIG_TYPE.MIKOMIKO, 'mik'],
    [LRIG_TYPE.MIDORIKO, 'mdr'],
    [LRIG_TYPE.ANN, 'ann'],
    [LRIG_TYPE.AIYAI, 'ayy'],
    [LRIG_TYPE.MEL, 'mel'],
    [LRIG_TYPE.MAMA, 'mam'],
    [LRIG_TYPE.AT, 'ato'],
    [LRIG_TYPE.WOLF, 'wlf'],
    [LRIG_TYPE.BANG, 'ban'],
    [LRIG_TYPE.SANGA, 'sng'],
    [LRIG_TYPE.URITH, 'urt'],
    [LRIG_TYPE.IONA, 'ion'],
    [LRIG_TYPE.UMR, 'umr'],
    [LRIG_TYPE.MYU, 'myu'],
    [LRIG_TYPE.ALFOU, 'alf'],
    [LRIG_TYPE.HANARE, 'hnr'],
    [LRIG_TYPE.NANASHI, 'nns'],
    [LRIG_TYPE.GUZUKO, 'gzk'],
    [LRIG_TYPE.TOKO, 'tok'],
    [LRIG_TYPE.MUZIKA, 'mzk'],
    [LRIG_TYPE.DEUX, 'des'],
    [LRIG_TYPE.MACHINA, 'mac'],
    [LRIG_TYPE.MACHINA, 'mah'],
    [LRIG_TYPE.MITO, 'mit'],
    [LRIG_TYPE.MUGEN, 'mug'],
    [LRIG_TYPE.MAYU, 'may'],
    [LRIG_TYPE.NIJISANJI, 'nij'],

    [TEAM_TYPE.ANCIENT_SURPRISE, 'ansp'],
    [TEAM_TYPE.CARD_JOCKEY, 'cjky'],
    [TEAM_TYPE.NO_LIMIT, 'nlmt'],
    [TEAM_TYPE.DIAGRAM, 'dgrm'],
    [TEAM_TYPE.DXM, 'dxma'],
    [TEAM_TYPE.UCHU_NO_HAJIMARI, 'uhjm'],
    [TEAM_TYPE.SANBAKA, 'snbk'],
    [TEAM_TYPE.KYURUKYURUN, 'crcr'],
    [TEAM_TYPE.DREAM_TEAM, 'drtm'],
    [TEAM_TYPE.NO_TEAM, 'fret']
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

for (let i: number = 0; i < LRIG_TEAM_NAME_PAIR.length; i++) {
    lrig_name_source.set(LRIG_TEAM_NAME_PAIR[i][0], LRIG_TEAM_NAME_PAIR[i][1]);
    lrig_name_source.set(LRIG_TEAM_NAME_PAIR[i][1], LRIG_TEAM_NAME_PAIR[i][0]);
}

const compact_color = (s: string) => {
    return color_source.get(s) || COMMON_WORD.UNKNOWN_COLOR;
};

const compact_card_type = (s: string) => {
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
        t: compact_card_type(d.card_type),
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
        fm: d.format,
        co: d.coin,
        so: d.sort,
        pr: d.product
    };
};

const expand = (c: CardDataCompact): CardData => {
    return {
        slug: c.s,
        name: c.n,
        pronounce: c.p,
        img: expand_img(c.i, c.s),   // @
        card_type: compact_card_type(c.t),
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
        format: c.fm,
        coin: c.co,
        sort: c.so,
        product: c.pr
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

const assert_equal_card_data = <T>(name: string, left: T, right: T): void => {
    let pass: boolean = false;
    // @ts-ignore
    const left_keys: (keyof T)[] = Object.keys(left);
    // @ts-ignore
    const right_keys: (keyof T)[] = Object.keys(right);

    if (left_keys.length !== right_keys.length) {
        console.error(`   FAILED: ${name}`);
        console.error(`     keys amount mismatch! ${name}`);
        return;
    }

    for (let i = 0; i < left_keys.length; i++) {
        pass = left[left_keys[i]] === right[left_keys[i]] || pass;
    }
    if (!pass) {
        console.error(`   FAILED: ${name}`);
        return;
    }
    for (let i = 0; i < right_keys.length; i++) {
        pass = left[right_keys[i]] === right[right_keys[i]] || pass;
    }
    if (!pass) {
        console.error(`   FAILED: ${name}`);
        return;
    }
    console.log(` PASSED: ${name}`);
};

export {
    compact,
    expand,
    trim_img_path,
    compact_img,
    trim_color_brace,
    compact_color,
    compact_card_type,
    compact_lrig_team,
    compact_lrig_team_multi,
    cleanup_skill_text_line,
    drop_no_value,
    erase_no_value,
    convert_power,
    assert_equal_card_data
};


