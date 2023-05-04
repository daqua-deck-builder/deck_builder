import fs from 'node:fs'
import process from 'node:process';
import path from 'node:path'
import * as cheerio from 'cheerio';
import type {CheerioAPI} from 'cheerio';
// @ts-ignore
import {JSDOM} from 'jsdom';

const FORMAT: Record<'all' | 'key' | 'diva', 1 | 2 | 3> = {
    all: 1,
    key: 2,
    diva: 3
};

type ColorCompact = 'w' | 'u' | 'k' | 'r' | 'g' | 'l' | '';   // l -> colorless
const compact_color = (color: string): ColorCompact => {
    let ret = '';
    const _ret = {
        '白': 'w',
        '青': 'u',
        '黒': 'k',
        '赤': 'r',
        '緑': 'g',
        '無': 'l',
    }[color];
    return _ret ? _ret : ret;
};

const compact_card_type = (card_type: string) => {
    let ret = '';
    const _ret = {
        'シグニ': 'sg',
        'スペル': 'sp',
        'ルリグ': 'lr',
        'アーツ': 'ar',
        'キー': 'ky',
        'ピース': 'pi',
        'レゾナ': 're',
        'アシストルリグ': 'al',
        'アーツ（クラフト）': 'ac',
        'レゾナ（クラフト）': 'rc',
    }[card_type];
    return _ret ? _ret : ret;
};

const compact_img = (path: string, slug: string) => {
    return path.split(slug).join('@');
};

const compact_cost = (cost: string) => {
    return cost.replace(/[《》]/g, '');
};

const convert_lrig_name_to_slug = (lrig_name: string): string => {
    const _ret = {
        'タマ': 'tam',
        'タウィル': 'taw',
        'リメンバ': 'rem',
        'サシェ': 'sas',
        'ドーナ': 'don',
        'エマ': 'ema',
        'リゼ': 'riz',
        'アンジュ': 'anj',
        'アキノ': 'akn',
        'LION': 'lio',
        'ノヴァ': 'nov',
        'ゆかゆか': 'yuk',
        '花代': 'hny',
        'ユヅキ': 'ydk',
        'リル': 'ril',
        'カーニバル': 'cnv',
        'レイラ': 'rla',
        'ＬｏＶ': 'lov',
        'ヒラナ': 'hrn',
        'LOVIT': 'lvt',
        'エクス': 'ex',
        'ピルルク': 'prk',
        'エルドラ': 'eld',
        'ミルルン': 'mil',
        'あや': 'aya',
        'レイ': 'rei',
        'タマゴ': 'tmg',
        'マドカ': 'mdk',
        'みこみこ': 'mik',
        '緑子': 'mdr',
        'アン': 'ann',
        'アイヤイ': 'ayy',
        'メル': 'mel',
        'ママ': 'mam',
        'アト': 'ato',
        'WOLF': 'wlf',
        'バン': 'ban',
        'サンガ': 'sng',
        'ウリス': 'urt',
        'イオナ': 'ion',
        'ウムル': 'umr',
        'ミュウ': 'myu',
        'アルフォウ': 'alf',
        'ハナレ': 'hnr',
        'ナナシ': 'nns',
        'グズ子': 'gzk',
        'とこ': 'tok',
        'ムジカ': 'mzk',
        'デウス': 'des',
        'マキナ': 'mac',
        'まほまほ': 'mah',
        '美兎': 'mit',
        '夢限': 'mug',
        '？': 'may',
        'にじさんじ': 'nij',

        '＜アンシエント･サプライズ＞': 'ansp',
        '＜ドリームチーム＞': 'drtm',
        'チーム制限なし': 'fret'
    }[lrig_name];

    return _ret ? _ret : '特定失敗';
}

const compact_team = (_teams: string[]): string[] => {
    let teams = _teams.map((team: string) => {
        const token: string = team.replace(/限定/, '');
        return convert_lrig_name_to_slug(token);
    });
    return teams;
};

type CardDataCompact = {
    s: string,      // slug
    n: string,      // name
    p: string,      // pronounce
    i: string,      // img
    t: string,      // card_type
    lr: string[],   // lrig
    lv: string,     // level
    c: string[],    // color
    cl: string[],   // klass
    cs: string[],   // cost
    l: string,      // limit
    pw: string,     // power
    tm: string[],   // team
    tp: boolean,    // team_piece
    ti: string[],  // timing
    r: string,      // rarity
    b: boolean,     // has_lb
    bt: string,     // lb_text
    sk: string[],   // skills
    st: 'd' | '',     // story
    fm: 1 | 2 | 3   // format
}

type CardData = {
    slug: string,
    name: string,
    pronounce: string,
    img: string,
    card_type: string,
    lrig: string[],
    level: string,
    color: string[],
    klass: string[],
    cost: string[],
    limit: string,
    power: string,
    team: string[],
    team_piece: boolean,
    timing: string[],
    rarity: string,
    has_lb: boolean,
    lb_text: string,
    skills: string[],
    story: 'd' | '',
    format: 1 | 2 | 3
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
        cs: d.cost.map(compact_cost),
        l: d.limit,
        pw: d.power,
        tm: compact_team(d.team),
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

const get_sample_file_list = (endpoint: string, ignore_strings: string[], tests: string[]): string[] => {
    const root_dir: string = path.dirname(endpoint);
    const files: string[] = [];
    tests = tests || [];

    fs.readdirSync(root_dir).forEach((filename: string): void => {
        if (tests.length > 0) {
            let passed = true;
            for (let i = 0; i < tests.length; i++) {
                passed = passed && filename.indexOf(tests[i]) > -1;
            }
            if (!passed) {
                return;
            }
        }

        if (filename.startsWith('sample')) {
            let ignore_found = false;
            for (let i = 0; i < ignore_strings.length; i++) {
                if (filename.indexOf(ignore_strings[i]) > -1) {
                    ignore_found = ignore_found || true;
                }
            }

            if (!ignore_found) {
                files.push(path.join(root_dir, filename));
            }
        }
    });
    return files.sort();
}
const replaceImgWithAlt = (html: string) => {
    const dom = new JSDOM(html);
    const imgElements = Array.from(dom.window.document.getElementsByTagName('img'));

    imgElements.forEach(img => {
        const altText = img.alt.replace(/2》/, '》');
        img.replaceWith(altText);
    });

    return dom.window.document.body.innerHTML;
};

const cleanup_skill_text_line = (t: string): string => {
    return t
        .replace(/　/g, ' ')
        .replace(/アイコン/g, '')
        .replace(/（.*）/ig, '')
        .replace(/\n/ig, '')
        .trim();
}

const parse_card_skills = ($: any): { skills: string[], has_lb: boolean } => {
    const $cs = $('.cardSkill');
    let ret: string[] = [];
    let has_lb: boolean = false;

    for (let i = 0; i < $cs.length; i++) {
        const skill_html = $($cs[i]).html();
        if (!skill_html) {
            return {skills: [], has_lb};
        }
        const skill_full = skill_html.trim();
        const skill_parsed = replaceImgWithAlt(skill_full);
        const skill_list = skill_parsed.split('<br>').map((s) => {
            has_lb = has_lb || s.indexOf('ライフバースト') === 0;
            return cleanup_skill_text_line(s);
        }).filter((s) => {
            return !!s
        });
        ret = [...ret, ...skill_list];
    }

    return {skills: ret, has_lb};
}

const parse_modern_structure = ($: any): CardData | false => {
    const slug: string = $('.cardNum').text();

    const $card_name_wrapper = $('.cardName');
    const _card_pronounce: string = $card_name_wrapper.find('span').text();
    const pronounce: string = $card_name_wrapper.find('span').text().replace(/[＜＞]/gi, '');
    const name: string = $card_name_wrapper.text().replace(_card_pronounce, '');

    // @ts-ignore
    const img: string = $('.cardImg img').attr('src');
    const rarity: string = $('.cardRarity').text();

    const $cd = $('.cardData dd');
    let card_type: string = $cd.eq(0).text();

    if (card_type === '-') {
        console.log('TOKEN');
        return false;
    }

    let lrig: string[] = [];
    const color: string[] = $cd.eq(2).text().split('');
    const level: string = $cd.eq(3).text();
    let cost: string[] = [];
    let klass: string[] = [];
    switch (card_type) {
        case 'ルリグ':
            cost = $cd.eq(4).text().split('\n');    // グロウコスト
            lrig = $cd.eq(1).text().replace(/限定/, '').split('/');
            break;
        case 'シグニ':
            klass = $cd.eq(1).text().split('\n');
            break;
        default:
            cost = $cd.eq(5).text().split('\n');    // スペル/\/アーツのコスト
            break;
    }

    const limit: string = $cd.eq(6).text(); // リミット消費は検索不可とするが、レベルと一致しないシグニはここに数値が入る
    const power: string = $cd.eq(7).text();
    const $card_skills = $('.cardSkill');
    const card_skill: string = $card_skills.text();

    let team: string[] = [];
    let team_piece: boolean = false;
    if (card_type === 'ピース') {
        if ($('.cardSkill img[alt*="ドリームチーム"]').length > 0) {
            team = ['＜ドリームチーム＞'];
            team_piece = true;
        } else {
            const condition: string = (card_skill.split('\n')[1] || '').trim();
            const regex = /＜(.*?)＞/g;
            try {
                // @ts-ignore
                const _team: string = condition.match(regex)[0];
                team = [`${_team}`];
                team_piece = true;
            } catch (error) {
                if (error instanceof TypeError) {
                    team = ['チーム制限なし'];
                } else {
                    throw(`パース失敗\n${card_skill}`);
                }
            }
        }
    } else if (card_type.startsWith('アーツ')) {
        if (card_type.indexOf('クラフト') > -1) {
            card_type = 'アーツ(クラフト)';
        }
        team = [$cd.eq(8).text()];
    } else if (card_type.startsWith('シグニ')) {
        if (card_type.indexOf('レゾナ') > -1) {    // 現状レゾナはレゾナ(クラフトしか存在しない)
            card_type = 'レゾナ(クラフト)';
        }
        team = $cd.eq(8).text().split('/');
    } else {
        team = [$cd.eq(8).text()];
    }

    const timing: string[] = $cd.eq(9).text().split('\n');

    let lb_text: string = '';
    let skills: string[] = [];
    let has_lb: boolean = false;

    if (card_type === 'シグニ' || card_type.startsWith('レゾナ')) {
        ({skills, has_lb} = parse_card_skills($));
    } else if (card_type === 'スペル') {
        ({skills, has_lb} = parse_card_skills($));
    } else if (card_type === 'ピース') {
        ({skills, has_lb} = parse_card_skills($));
    } else {
        // アーツ・ルリグ
        // @ts-ignore
        $card_skills.each((index, elem) => {
            skills.push($(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n'));
        });
        ({skills, has_lb} = parse_card_skills($));
    }

    const story = $($cd.eq(11)).find('img[src*="dissona"]').length > 0 ? 'd' : '';

    const format: 1 | 2 | 3 = (($$: any): 1 | 2 | 3 => {
        if ($$.find('img[alt*="ディーヴァ"]').length > 0) {
            return FORMAT.diva;
        } else if ($$.find('img[alt*="キー"]').length > 0) {
            return FORMAT.key;
        } else {
            return FORMAT.all;
        }
    })($cd.eq(10));


    return {
        slug,
        name: name.replace(/　/ig, ' '),
        pronounce,
        img: img.split('/card/')[1],
        card_type,
        lrig,
        level: level === '-' ? '' : level,
        color,
        klass,
        cost: cost.filter(c => '-' !== c),
        limit: limit === '-' ? '' : limit,
        power: power === '-' ? '' : power,
        team: team.filter(t => {
            return t !== '-';
        }),
        team_piece,
        timing: timing.filter(t => {
            return t !== '-';
        }),
        rarity,
        has_lb,
        lb_text,
        skills,
        story,
        format
    };
};

(() => {
    const tests: string[] = process.argv.slice(2);

    get_sample_file_list(process.argv[1], [], tests).forEach((card_file: string) => {
        fs.readFile(card_file, (err: Error | null, _data: Buffer) => {
            if (err) throw err;
            const html: string = _data.toString();

            const $: CheerioAPI = cheerio.load(html);

            console.log(card_file);

            const d: CardData | false = parse_modern_structure($);
            if (d) {
                console.log(compact(d));
                // console.log(d);
            }
        });
    });
})();