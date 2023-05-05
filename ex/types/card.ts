const FORMAT: Record<'all' | 'key' | 'diva', 1 | 2 | 3> = {
    all: 1,
    key: 2,
    diva: 3
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
};

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

export {
    FORMAT
};

export type {
    CardData,
    CardDataCompact
};