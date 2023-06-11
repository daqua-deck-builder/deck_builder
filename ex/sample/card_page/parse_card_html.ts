import fs from 'node:fs'
import process from 'node:process';
import path from 'node:path'
import * as cheerio from 'cheerio';
import type {CheerioAPI} from 'cheerio';
import {JSDOM} from 'jsdom';
import {
    compact,
    cleanup_skill_text_line,
    drop_no_value,
    erase_no_value,
    trim_img_path,
    convert_power, expand, assert_equal_card_data
} from "../../compact/functions.js";
import {type CardData} from "../../types/card.js";
import {FORMAT, CARD_TYPE, COMMON_WORD, TEAM_TYPE} from "../../constants.js";

const CHECK_FILE_PREFIX = 'sample';

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

        if (filename.startsWith(CHECK_FILE_PREFIX)) {
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
const replaceImgWithAlt = (html: string): string => {
    const dom: JSDOM = new JSDOM(html);
    const imgElements: HTMLImageElement[] = Array.from(dom.window.document.getElementsByTagName('img'));

    imgElements.forEach(img => {
        const altText: string = img.alt.replace(/2》/, '》');
        img.replaceWith(altText);
    });

    return dom.window.document.body.innerHTML;
};

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
            has_lb = has_lb || s.indexOf(COMMON_WORD.LIFE_BURST) === 0;
            return cleanup_skill_text_line(s);
        }).filter((s: string) => {
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
        case CARD_TYPE.LRIG:
            cost = $cd.eq(4).text().split('\n');    // グロウコスト
            lrig = $cd.eq(1).text().replace(/限定/, '').split('/');
            card_type = 'センタールリグ';  // アシストの場合は最初から「アシストルリグ」が取得されている
            break;
        case CARD_TYPE.SIGNI:
            klass = $cd.eq(1).text().split('\n');
            break;
        default:
            cost = $cd.eq(5).text().split('\n');    // スペル/アーツのコスト
            break;
    }

    const limit: string = $cd.eq(6).text(); // リミット消費は検索不可とするが、レベルと一致しないシグニはここに数値が入る
    const power: string = $cd.eq(7).text();
    const $card_skills = $('.cardSkill');
    const card_skill: string = $card_skills.text();

    let team: string[] = [];
    let team_piece: boolean = false;
    if (card_type.startsWith(CARD_TYPE.PIECE)) {

        if (card_type.indexOf('リレー') > -1) {
            card_type = CARD_TYPE.PIECE_RELAY;
        }

        if ($('.cardSkill img[alt*="ドリームチーム"]').length > 0) {
            team = [TEAM_TYPE.DREAM_TEAM];
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
                    team = [TEAM_TYPE.NO_TEAM];
                } else {
                    throw(`パース失敗\n${card_skill}`);
                }
            }
        }
    } else if (card_type.startsWith(CARD_TYPE.ARTS)) {
        if (card_type.indexOf(CARD_TYPE.FLAG.CRAFT) > -1) {
            card_type = CARD_TYPE.ARTS_CRAFT;
        }
        team = [$cd.eq(8).text()];
    } else if (card_type.startsWith(CARD_TYPE.SIGNI)) {
        if (card_type.indexOf(CARD_TYPE.RESONA) > -1) {    // 現状レゾナはレゾナ(クラフトしか存在しない) todo: そうではないかも
            card_type = CARD_TYPE.RESONA_CRAFT;
        }
        team = $cd.eq(8).text().split('/');
    } else {
        team = [$cd.eq(8).text()];
    }


    let lb_text: string = '';
    let skills: string[] = [];
    let has_lb!: boolean;

    if (card_type === CARD_TYPE.SIGNI || card_type.startsWith(CARD_TYPE.RESONA)) {
        ({skills, has_lb} = parse_card_skills($));
    } else if (card_type === CARD_TYPE.SPELL) {
        ({skills, has_lb} = parse_card_skills($));
    } else if ((card_type === CARD_TYPE.PIECE) || (card_type === CARD_TYPE.PIECE_RELAY)) {
        ({skills, has_lb} = parse_card_skills($));
    } else {
        // アーツ・ルリグ
        ({skills, has_lb} = parse_card_skills($));
    }

    const story = $($cd.eq(11)).find('img[src*="dissona"]').length > 0 ? 'd' : '';

    let format: 1 | 2 | 3 = (($$: any): 1 | 2 | 3 => {
        if ($$.find('img[alt*="ディーヴァ"]').length > 0) {
            return FORMAT.diva;
        } else if ($$.find('img[alt*="キー"]').length > 0) {
            return FORMAT.key;
        } else {
            return FORMAT.all;
        }
    })($cd.eq(10));

    // この項目はフレキシブル
    const $cdt = $('.cardData dt');
    const dt9_text = $cdt.eq(9).text(); // ガード,コイン,使用タイミング
    const dd9_value = $cd.eq(9).text()

    let coin: string = '';
    let timing: string[] = [];

    // console.log({dt9_text, value: $cd.eq(9).text()});

    if (dt9_text.indexOf('コイン') > -1) {
        coin = $cd.eq(9).text().replace(/\-/, '');
        // } else if (dt9_text.indexOf('タイミング') > -1) { // 使用タイミングを「ガード」の項目名で記述しているカードが存在するので↓のように値から逆順で処理する
        //     timing = $cd.eq(9).text().split('\n');
    }

    if ((dd9_value.indexOf('フェイズ') > -1) || (dd9_value.indexOf('スペルカットイン') > -1)) {
        timing = dd9_value.split('\n');
    }
    const skills_combined = skills.join('@@');

    if (skills_combined.indexOf('《コイン》') > -1) {
        coin = ((text: string, coin_ever: string) => {
            const pattern = /(《コイン》)+(《コイン》)?を得る/;
            const match = text.match(pattern);
            let count = 0;
            if (match) {
                const coinPattern = /《コイン》/g;
                const coins = [...match[0].matchAll(coinPattern)];
                count = coins.length;
            }

            if (count > 0) {
                return coin_ever ? [coin_ever, `${count}*`].join(' / ') : `${count}*`;
            } else {
                return '';
            }
        })(skills_combined, coin);
    }

    if (card_type === 'コイン') {
        format = FORMAT.diva
    }

    try {
        return {
            slug,
            name: name.replace(/　/ig, ' '),
            pronounce,
            img: trim_img_path(img),
            card_type,
            lrig,
            level: erase_no_value(level),
            color,
            klass,
            cost: drop_no_value(cost),
            limit: erase_no_value(limit),
            power: convert_power(erase_no_value(power)),
            team: drop_no_value(team),
            team_piece,
            timing: drop_no_value(timing),
            rarity,
            has_lb,
            lb_text,
            skills,
            story,
            format,
            coin,

            // DB格納時にセットする
            sort: 0,
            product: ''
        };
    } catch {
        throw new Error()
    }
};

if (process.argv[1].indexOf('parse_card_html') > -1) {
    (() => {
        const tests: string[] = process.argv.slice(2);

        get_sample_file_list(process.argv[1], [], tests).forEach((card_file: string) => {
            console.log({card_file});
            fs.readFile(card_file, (err: Error | null, _data: Buffer) => {
                if (err) throw err;
                const html: string = _data.toString();

                const $: CheerioAPI = cheerio.load(html);

                console.log(card_file);

                const d: CardData | false = parse_modern_structure($);
                if (d) {
                    // assert_equal_card_data(d.name, expand(compact(d)), d);
                    // assert_equal_card_data(d.name, compact(d), compact(expand(compact(d))));

                    // console.log(d);
                    // console.log(compact(d));
                    console.log(compact(d).co);
                }
            });
        });
    })();
}

export {parse_modern_structure}