export const enum STONE {
    EMPTY = -1,
    BLACK = 1,
    WHITE = 2
}

export const enum MARK {
    NONE,
    SELECTED,
    STAR,
    PLUS,
    SQUARE,
    CROSS,
    TRIANGLE,
    CIRCLE,
    BLACK_TERRITORY,
    WHITE_TERRITORY
};

export const COORDS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'.split('');

export const SGF_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const MARKER_PROP_MAP = {
    'TW': MARK.WHITE_TERRITORY,
    'TB': MARK.BLACK_TERRITORY,
    'CR': MARK.CIRCLE,
    'TR': MARK.TRIANGLE,
    'MA': MARK.CROSS,
    'SQ': MARK.SQUARE
};

export const INFO_PROP_MAP = {
    'AN': 'annotator',
    'CP': 'copyright',
    'DT': 'date',
    'EV': 'event',
    'GN': 'gameName',
    'OT': 'overtime',
    'RO': 'round',
    'RE': 'result',
    'RU': 'rules',
    'SO': 'source',
    'TM': 'time',
    'PC': 'location',
    'PB': 'black',
    'PW': 'white',
    'BR': 'blackRank',
    'WR': 'whiteRank',
    'BT': 'blackTeam',
    'WT': 'whiteTeam'
};

export const SETUP_PROPS = [
    'AB', 'AW', 'AE'
];

export const MOVE_PROPS = [
    'B', 'W'
];

export const COMMENT_PROPS = [
    'C'
];

export const LABEL_PROPS = [
    'LB'
];

export const HANDICAP_PROPS = [
    'HA'
];

export const MARKER_PROPS = Object.keys(MARKER_PROP_MAP);

export const INFO_PROPS = [
    'AN', 'CP', 'DT', 'EV', 'GN', 'OT', 'RO', 'RE',
    'RU', 'SO', 'TM', 'PC', 'PB', 'PW', 'BR', 'WR',
    'BT', 'WT',
];

