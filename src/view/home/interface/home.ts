export interface ILattice{
    id:number;
    lattice:ICoordinate;// 棋子位置
    value:number;// 棋子状态（0未落子，1/2落子人）
}
export interface ICoordinate{
    latticeX:number;// 棋子位置X轴
    latticeY:number;// 棋子位置Y轴
}

export interface IChessboard{
    chessboardX:number;// 棋盘长度X轴
    chessboardY:number;// 棋盘高度Y轴
    gameMode:number;// 胜利需要连接的棋子
}
