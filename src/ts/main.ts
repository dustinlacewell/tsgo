import { STONE as S, MARK as M } from "./consts";
import { TSGo, GetSGF } from "./controller/TSGo";


const STONE = {
    BLACK: S.BLACK,
    WHITE: S.WHITE,
    EMPTY: S.EMPTY,
};

const MARK = {
    NONE: M.NONE,
    SELECTED: M.SELECTED,
    SQUARE: M.SQUARE,
    CIRCLE: M.CIRCLE,
    STAR: M.STAR,
    CROSS: M.CROSS,
    PLUS: M.PLUS,
    TRIANGLE: M.TRIANGLE,
    BLACK_TERRITORY: M.BLACK_TERRITORY,
    WHITE_TERRITORY: M.WHITE_TERRITORY,
};

export { TSGo, GetSGF, STONE, MARK };


