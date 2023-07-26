export enum EGameStart {
    GAME_DRAW=-1, // 游戏平局
    GAME_START, // 游戏未结束
    GAME_VICTORY_X, // X获胜
    GAME_VICTORY_O, // O获胜
}
export enum EPlacingPieces {
    LOCINPIECES_INIT, // 默认无显示棋子
    LOCINPIECES_X, // 棋子X/黑棋标识符
    LOCINPIECES_O, // 棋子O/白棋标识符
}
export enum EGameType {
    FIRST_TYPE, // 游戏类型3子
    SECOND_TYPE, // 游戏类型5子
}

export enum EGameMode {
    FIRST_MODE=3, // 游戏连线棋子三子棋
    SECOND_MODE=5, // 游戏连线棋子五子棋
}
export enum ELayout {
    FIRST_LOYOUT=3, // 游戏格局三子棋
    SECOND_LOYOUT=8, // 游戏格局五子棋
}

export const GAME_INIT = -1;
