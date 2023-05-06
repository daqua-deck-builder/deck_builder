import {PrismaClient} from '@prisma/client'
import {CardData} from "../../types/card.js";
import {cover_condition} from "../../crawler/functions.js";

const prisma = new PrismaClient();

const convert_ad_hoc = (cd: CardData): any => {
    const lrig = cd.lrig.join(',');
    const color = cd.color.join(',');
    const klass = cd.klass.join(',');
    const cost = cd.cost.join(',');
    const team = cd.team.join(',');
    const timing = cd.timing.join(',');
    const skills = cd.skills.join('@@');

    return {
        ...cd,
        lrig,
        color,
        klass,
        cost,
        team,
        timing,
        skills
    };
}
const insert_card_if_new = async (data: CardData) => {
    return new Promise<void>(async (resolve) => {
        const converted = convert_ad_hoc(data);
        const exists = await prisma.card.upsert({
            where: {slug: data.slug},
            create: converted,
            update: converted
        });

        console.log(exists)

        // if (!exists) {
        //     // @ts-ignore
        //     const r = await prisma.card.create({data: convert_ad_hoc(data)});
        //
        //     return r;
        // } else {
        //     console.log(`${data.slug} already exists.`);
        // }
        resolve();
    });
};

export {insert_card_if_new}

insert_card_if_new({
    slug: 'WXDi-P00-036',
    name: '紅魔姫 シュブニグラ',
    pronounce: 'コウマキシュブニグラ',
    img: 'WXDi/WXDi-P00-036.jpg',
    card_type: 'シグニ',
    lrig: [],
    level: '3',
    color: ['赤'],
    klass: ['奏像：悪魔'],
    cost: [],
    limit: '',
    power: '12k',
    team: ['-'],
    team_piece: false,
    timing: ['-'],
    rarity: 'SR',
    has_lb: false,
    lb_text: '',
    skills: [
        '【チーム】＜アンシエント・サプライズ＞',
        '【チーム自】：このシグニがアタックしたとき、あなたの場にあるすべてのシグニが赤の場合、対戦相手のパワー１２０００以 下のシグニ１体を対象とし、《赤》《赤》を支払ってもよい。そうした場合、それをバニッシュする。',
        '【出】《赤》《赤》《赤》：ターン終了時まで、このシグニは【ダブルクラッシュ】を得る。'
    ],
    story: '',
    format: 3
})