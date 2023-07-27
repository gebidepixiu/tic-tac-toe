export const EGameStart = {
    // 游戏平局
    GAME_DRAW: -1,
    // 游戏未结束
    GAME_START: 0,
    // X获胜
    GAME_VICTORY_X: 1,
    // O获胜
    GAME_VICTORY_O: 2,
};
export const EPlacingPieces = {
    // 默认无显示棋子
    LOCINPIECES_INIT: 0,
    // 棋子X/黑棋标识符
    LOCINPIECES_X: 1,
    // 棋子O/白棋标识符
    LOCINPIECES_O: 2,
};
export const EGameType = {
    // 游戏类型3子棋
    FIRST_TYPE: 0,
    // 游戏类型5子棋
    SECOND_TYPE: 1,
};

export const EGameMode = {
    // 游戏连线棋子
    FIRST_MODE: 3,
    // 游戏连线棋子
    SECOND_MODE: 5,
};
export const ELayout = {
    // 游戏格局
    FIRST_LOYOUT: 3,
    // 游戏格局
    SECOND_LOYOUT: 8,
};
// 初始化数据
export const GAME_INIT = -1;


export interface ILattice{
    id:number;
    // 棋子位置
    lattice:ICoordinate;
    // 棋子状态（0未落子，1/2落子人）
    value:number;
}
export interface ICoordinate{
    // 棋子位置X轴
    latticeX:number;
    // 棋子位置Y轴
    latticeY:number;
}

export interface IChessboard{
    // 棋盘长度X轴
    chessboardX:number;
    // 棋盘高度Y轴
    chessboardY:number;
    // 胜利需要连接的棋子
    gameMode:number;
}
