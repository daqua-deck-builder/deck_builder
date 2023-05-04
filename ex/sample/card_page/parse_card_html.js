import fs from 'node:fs'
import process from 'node:process';
import path from 'node:path'
import * as cheerio from 'cheerio';

const get_sample_file_list = (endpoint, ignore_strings, tests) => {
    const root_dir = path.dirname(endpoint);
    const files = [];
    tests = tests || [];

    fs.readdirSync(root_dir).map(filename => {
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

const parse_modern_structure = ($) => {
    console.log('MODERN');
    const slug = $('.cardNum').text();

    const $card_name_wrapper = $('.cardName');
    const card_pronounce = $card_name_wrapper.find('span').text();
    const card_name = $card_name_wrapper.text().replace(card_pronounce, '');

    const img = $('.cardImg img').attr('src');
    const rarity = $('.cardRarity').text();

    const $cd = $('.cardData dd');
    let card_type = $cd.eq(0).text();

    if (card_type === '-') {
        console.log('TOKEN');
        return false;
    }

    let lrig = [];
    const color = $cd.eq(2).text().split('');
    const level = $cd.eq(3).text();
    let cost = '';
    let klass = [];
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
    const limit = $cd.eq(6).text(); // リミット消費は検索不可とするが、レベルと一致しないシグニはここに数値が入る
    const power = $cd.eq(7).text();
    const $card_skills = $('.cardSkill');
    const card_skill = $('.cardSkill').text();

    let team = '';
    let team_piece = false;
    if (card_type === 'ピース') {
        if ($('.cardSkill img[alt*="ドリームチーム"]').length > 0) {
            team = ['＜ドリームチーム＞'];
            team_piece = true;
        } else {
            const condition = (card_skill.split('\n')[1] || '').trim();
            const regex = /\＜(.*?)\＞/g;
            try {
                const _team = condition.match(regex)[0];
                team = `${_team}`;
                team_piece = true;
            } catch (error) {
                if (error instanceof TypeError) {
                    team = 'チーム制限なし';
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

    const timing = $cd.eq(9).text().split('\n');

    let has_lifeburst = false;
    let lb_text = '';
    const skills = [];

    if (card_type === 'シグニ' || card_type.startsWith('レゾナ')) {
        $card_skills.each((index, elem) => {
            let skill_single = $(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n');
            const find_a = $(elem);
            if (find_a.children('img[alt="ライフバースト"]').length > 0) {
                has_lifeburst = true;
                skill_single = 'LB ' + skill_single.replace(/^：/, '');
            } else if (find_a.children('img[alt*="出"]').length > 0) {
                skill_single = 'CP ' + skill_single.replace(/^：/, '');
            } else if (find_a.children('img[alt*="自"]').length > 0) {
                skill_single = 'AU ' + skill_single.replace(/^：/, '');
            }
            skills.push(skill_single);
        });
    } else if (card_type === 'スペル') {
        $card_skills.each((index, elem) => {
            let skill_single = $(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n');
            const find_a = $(elem);
            if (find_a.children('img[alt="ライフバースト"]').length > 0) {
                has_lifeburst = true;
                skill_single = 'LB ' + skill_single.replace(/^：/, '');
            }
            skills.push(skill_single);
        });
    } else if (card_type === 'ピース') {
        console.log('PIECE');
        $card_skills.each((index, elem) => {
            const splitted = $(elem).text().split('\n').map((text) => {
                return text.replace(/[\s　]+/ig, '');
            }).filter((t) => {return !!t});

            const [requires, ...skill_texts_rest] = splitted;
            skills.push(`${requires}: ${skill_texts_rest.join('\n').replace(/\n+/ig, '\n')}`);
        });
    } else {
        $card_skills.each((index, elem) => {
            skills.push($(elem).text().trim().replace(/\s/ig, '').replace(/\n+/ig, '\n'));
        });
    }


    const data = {
        slug,
        card_name,
        pronounce: card_pronounce.replace(/[＜＞]/gi, ''),
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
        has_lifeburst,
        lb_text,
        skills
    };
    return data;
}

const parse_legacy_structure = ($) => {
    console.log('LEGACY');
    const slug = $('.card_detail_title p').text();

    const $card_name_wrapper = $('.card_detail_title h3');
    const card_pronounce = $card_name_wrapper.find('span').text();
    const card_name = $card_name_wrapper.text().replace(card_pronounce, '');

    const img = $('.card_img img').attr('src');
    const rarity = $('.card_rarity').text().trim();

    const $cd = $('.card_detail_date td');
    const card_type = $cd.eq(0).text();
    const lrig = $cd.eq(1).text().replace(/限定/, '').split('/');
    const color = $cd.eq(2).text().split('');
    const level = $cd.eq(3).text();

    let cost = '';
    let klass = [];

    switch (card_type) {
        case 'ルリグ':
            // glow cost
            cost = $cd.eq(4).text();    // グロウコスト
            break;
        case 'シグニ':
            klass = $('.card_data_td_c').eq(1).text().split('\n');
            break;
        default:
            cost = $cd.eq(5).text();    // スペル/\/アーツのコスト
            break;
    }
    const limit = $cd.eq(6).text(); // リミット消費は検索不可とするが、レベルと一致しないシグニはここに数値が入る
    const power = $cd.eq(7).text();

    let team = [];
    const _team = $cd.eq(8).text();
    if (_team.indexOf('/') > -1) {
        team = _team.split('/').map(t => {
            return t.replace(/限定/, '') + '限定';
        })
    } else {
        team = [_team];
    }


    const timing = $cd.eq(9).text().split('\n');

    const data = {
        slug,
        card_name,
        pronounce: card_pronounce.replace(/[＜＞]/gi, ''),
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
        timing,
        rarity
    };
    return data;
};

(() => {
    const tests = process.argv.slice(2);

    get_sample_file_list(process.argv[1], ['legacy'], tests).forEach((card_file) => {
        fs.readFile(card_file, (err, _data) => {
            if (err) throw err;
            const html = _data.toString();

            const $ = cheerio.load(html);

            let d = {};
            console.log(card_file);

            if ($('.card_detail').length > 0) {
                d = parse_legacy_structure($)
            } else {
                d = parse_modern_structure($)
            }
            console.log(d);
        });
    });
})();