/**
 * 棋手类型
 * @param LOCINPIECES_INIT 默认无显示棋子
 * @param LOCINPIECES_X 棋子X/黑棋标识符
 * @param LOCINPIECES_O 棋子O/白棋标识符
 */
export const EPlacingPieces = {
    // 默认无显示棋子
    LOCINPIECES_INIT: 0,
    // 棋子X/黑棋标识符
    LOCINPIECES_X: 1,
    // 棋子O/白棋标识符
    LOCINPIECES_O: 2,
};
/**
 * 游戏类型表示
 * @param FIRST_TYPE 游戏类型3子棋
 * @param SECOND_TYPE 棋子X/游戏类型5子棋
 */
export const EGameType = {
    // 游戏类型3子棋
    FIRST_TYPE: 0,
    // 游戏类型5子棋
    SECOND_TYPE: 1,
};
/**
 * 游戏连子类型
 * @param FIRST_MODE 游戏连线棋子
 * @param SECOND_MODE 游戏连线棋子
 */
export const EGameMode = {
    // 游戏连线棋子
    FIRST_MODE: 3,
    // 游戏连线棋子
    SECOND_MODE: 5,
};
/**
 * 游戏布局
 * @param FIRST_LOYOUT 游戏格局3x3
 * @param SECOND_LOYOUT 游戏格局8x8
 */
export const ELayout = {
    // 游戏格局3x3
    FIRST_LOYOUT: 3,
    // 游戏格局8x8
    SECOND_LOYOUT: 8,
};
// 初始化数据
export const GAME_INIT = -1;

/**
 * 棋子属性
 * @param id 棋格id
 * @param lattice 棋子位置
 * @param value 棋子状态（0未落子，1/2落子人）
 */
export interface ILattice{
    // 棋格id
    id:number;
    // 棋子位置
    lattice:ICoordinate;
    // 棋子状态（0未落子，1/2落子人）
    value:number;
}
/**
 * 棋子位置
 * @param latticeX 棋子位置X轴
 * @param latticeY 棋子位置Y轴
 */
export interface ICoordinate{
    // 棋子位置X轴
    latticeX:number;
    // 棋子位置Y轴
    latticeY:number;
}
/**
 * 棋盘布局
 * @param chessboardX 棋盘长度X轴
 * @param chessboardY 棋盘高度Y轴
 * @param gameMode 胜利需要连接的棋子
 */
export interface IChessboard{
    // 棋盘长度X轴
    chessboardX:number;
    // 棋盘高度Y轴
    chessboardY:number;
    // 胜利需要连接的棋子
    gameMode:number;
}
