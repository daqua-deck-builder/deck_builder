import fs from 'node:fs'
import process from 'node:process';
import path from 'node:path'
import * as cheerio from 'cheerio';
import type {CheerioAPI} from 'cheerio';
// @ts-ignore
import {JSDOM} from 'jsdom';

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
    skills: string[]
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
        const altText = img.alt;
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

const parse_card_skills = ($: any): {skills: string[], has_lb: boolean} => {
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
        }).filter((s) => {return !!s});
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
    } else if (card_type.startsWith('シグニ')) {
        if (card_type.indexOf('レゾナ') > -1) {    // 現状レゾナはレゾナ(クラフトしか存在しない)
            card_type = 'レゾナ(クラフト)';
        }
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

    return <CardData>{
        slug,
        name,
        pronounce,
        img,
        card_type,
        lrig,
        level,
        color,
        klass,
        cost,
        limit,
        power,
        team,
        team_piece,
        timing,
        rarity,
        has_lb,
        lb_text,
        skills
    };
}

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
                console.log(d);
            }
        });
    });
})();