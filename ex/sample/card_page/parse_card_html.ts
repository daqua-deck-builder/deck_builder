import fs from 'node:fs'
import process from 'node:process';
import path from 'node:path'
import * as cheerio from 'cheerio';
import type {CheerioAPI} from 'cheerio';

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
    cost: string,
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

    fs.readdirSync(root_dir).map((filename: string): void => {
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

// const parse_modern_structure = ($: CheerioAPI): CardData | false => {
const parse_modern_structure = ($: any): CardData | false => {
    console.log('MODERN');
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
    let cost: string = '';
    let klass: string[] = [];
    switch (card_type) {
        case 'ルリグ':
            // glow cost
            cost = $cd.eq(4).text();    // グロウコスト
            lrig = $cd.eq(1).text().replace(/限定/, '').split('/');
            break;
        case 'シグニ':
            klass = $cd.eq(1).text().split('\n');
            break;
        default:
            cost = $cd.eq(5).text();    // スペル/\/アーツのコスト
            break;
    }
    // lrig = $cd.eq(1).text().replace(/限定/, '').split('/');
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

    let has_life_burst: boolean = false;
    let lb_text: string = '';
    const skills: string[] = [];

    if (card_type === 'シグニ' || card_type.startsWith('レゾナ')) {
        // @ts-ignore
        $card_skills.each((index, elem) => {
            let skill_single = $(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n');
            const find_a = $(elem);
            if (find_a.children('img[alt="ライフバースト"]').length > 0) {
                has_life_burst = true;
                skill_single = 'LB ' + skill_single.replace(/^：/, '');
            } else if (find_a.children('img[alt*="出"]').length > 0) {
                skill_single = 'CP ' + skill_single.replace(/^：/, '');
            } else if (find_a.children('img[alt*="自"]').length > 0) {
                skill_single = 'AU ' + skill_single.replace(/^：/, '');
            }
            skills.push(skill_single);
        });
    } else if (card_type === 'スペル') {
        // @ts-ignore
        $card_skills.each((index, elem) => {
            let skill_single = $(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n');
            const find_a = $(elem);
            if (find_a.children('img[alt="ライフバースト"]').length > 0) {
                has_life_burst = true;
                skill_single = 'LB ' + skill_single.replace(/^：/, '');
            }
            skills.push(skill_single);
        });
    } else if (card_type === 'ピース') {
        console.log('PIECE');
        // @ts-ignore
        $card_skills.each((index, elem) => {
            const split_result = $(elem).text().split('\n').map((text: string) => {
                return text.replace(/[\s　]+/ig, '');
            }).filter((t: string) => {
                return !!t
            });

            const [requires, ...skill_texts_rest] = split_result;
            skills.push(`${requires}: ${skill_texts_rest.join('\n').replace(/\n+/ig, '\n')}`);
        });
    } else {
        // @ts-ignore
        $card_skills.each((index, elem) => {
            skills.push($(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n'));
        });
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
        has_lb: has_life_burst,
        lb_text,
        skills
    };
}

(() => {
    const tests: string[] = process.argv.slice(2);

    get_sample_file_list(process.argv[1], ['legacy'], tests).forEach((card_file: string) => {
        fs.readFile(card_file, (err: Error | null, _data: Buffer) => {
            if (err) throw err;
            const html: string = _data.toString();

            const $: CheerioAPI = cheerio.load(html);

            let d: Object = {};
            console.log(card_file);

            // @ts-ignore
            if ($('.card_detail').length > 0) {
                console.log('legacy')
            } else {
                d = parse_modern_structure($);
            }
            console.log(d);
        });
    });
})();