import { IChessboard, ILattice, EPlacingPieces } from '../view/home/interface/home';


const {
    LOCINPIECES_X,
    LOCINPIECES_O,
} = EPlacingPieces;

interface IGameState {
    gameState: boolean;
    findValue?: { findValue: IFindValue[], lattice_init: number};
    currentPlId: number;
}
interface IFindValue { lattice: ILattice[], lattice_X: number, lattice_O: number, lattice_init:number}
// 定义查询的落子点的8条角度
const useFindPath: { id: number, value: number[], type: boolean }[] = [
    {
        id: 0,
        value: [-1, -1],
        type: true,
    },
    {
        id: 1,
        value: [0, -1],
        type: true,
    },
    {
        id: 2,
        value: [1, -1],
        type: true,
    },
    {
        id: 3,
        value: [-1, 0],
        type: true,
    },
];
/**
 * 判断游戏是否结束
 * @param chessboard 当前棋盘上所有点，以及当前选中的棋格
 * @param layout 棋盘布局
 * */
export const determineLattice = (chessboard: { placingPieces: ILattice, latticeList: ILattice[] }, layout: IChessboard) => {
    const {
        placingPieces,
        latticeList,
    } = chessboard;
    const { gameMode } = layout;

    let gameState: IGameState = {
        /** 设置游戏状态是否结束游戏 */
        gameState: false,
        // 设置ai可以点击的点
        currentPlId: -1,
    };

    // 优化查找的范围
    const useLatticeList = opDetermineLattice(latticeList, gameMode, placingPieces);

    gameState = selectLattic(placingPieces, gameMode, useLatticeList, gameState);
    if (placingPieces.value === LOCINPIECES_X) {
        aiSelect(placingPieces, gameMode, useLatticeList);
        // 获取ai的落子点
        // gameState.currentPlId = aiSelect(findValue, backPlList, layout, latticeList);
        // gameState.gameState = false;
    }
    return gameState;
};
/**
 * ai判断落子
 * @param placingPieces
 * @param gameMode
 * @param useLatticeList
 */
const aiSelect = (placingPieces:ILattice, gameMode: number, useLatticeList: Map<string, ILattice>) => {
    const aILatticeX = placingPieces.value === LOCINPIECES_X ? 'lattice_O' : 'lattice_X';
    const aILatticeY = placingPieces.value === LOCINPIECES_X ? 'lattice_X' : 'lattice_O';
    let maxLattice_init;
    // 获取棋盘每个子之间黑白子个数
    const gameState: IGameState = {
        /** 设置游戏状态是否结束游戏 */
        gameState: false,
        // 设置ai可以点击的点
        currentPlId: -1,
    };
    let latticeSelectAll: IGameState = {
        gameState: false,
        // 设置ai可以点击的点
        currentPlId: -1,
    };
    for (const useLatticeListKeyKey of useLatticeList.values()) {
        latticeSelectAll = selectLattic(useLatticeListKeyKey, gameMode, useLatticeList, gameState);
        if (typeof latticeSelectAll.findValue?.findValue !== 'undefined') {
            const { findValue } = latticeSelectAll;
            for (let sI = 0; sI < findValue.findValue.length; sI++) {
                if (findValue.findValue[sI][aILatticeX] === (gameMode - 1)) {
                    console.log('找到ai的');
                }
                if (findValue.findValue[sI][aILatticeY] === (gameMode - 1)) {
                    console.log('找到玩家的');
                }
            }
            if (typeof maxLattice_init === 'undefined') {
                maxLattice_init = findValue.lattice_init;
            } else {
                maxLattice_init = findValue.lattice_init > maxLattice_init ? findValue.lattice_init : maxLattice_init;
            }
            console.log(findValue);
            console.log(maxLattice_init);
        }
    }
};

/**
 * 查询传入棋子周边最长gameMode上有多少条同类型线
 * @param placingPieces //需要查找的点
 * @param gameMode //最长查找路线
 * @param useLatticeList //当前查找的棋盘
 * @param gameState //查找后的状态
 */
const selectLattic = (placingPieces: ILattice, gameMode: number, useLatticeList: Map<any, any>, gameState: IGameState) => {
    // 用于获取各条findPath里的数据，在查询完前4条后归0开始反方向查找
    let findPosition = 0;
    // 临时存储点击的点位8个方向上的点，用于判断是否相同
    const findPositionPath = [0, 0];
    // 定义查询的四条线
    const findPath = [];
    for (let fI = 0; fI < useFindPath.length; fI++) {
        findPath.push(useFindPath[fI]);
    }
    let gameModeMap;
    // 存储每条线上的相同棋子各有多少
    const findValue:IFindValue[] = [];

    let lattice_init:number = 0;

    // 先将点击的点存入findValue
    for (let positionI = 0; positionI < useFindPath.length; positionI++) {
        findValue[positionI] = {
            lattice: [placingPieces],
            lattice_O: 0,
            lattice_X: 0,
            lattice_init: 0,
        };
        if (placingPieces.value === LOCINPIECES_X) {
            findValue[positionI].lattice_X += 1;
        } else if (placingPieces.value === LOCINPIECES_O) {
            findValue[positionI].lattice_O += 1;
        } else {
            findValue[positionI].lattice_init += 1;
        }
    }

    // 以点击中心向8个方向查找
    for (let findI = 0; findI < (findPath.length * 2); findI++) {
        // 切换往反方向查找
        if (findI === 4) {
            findPosition = 0;
        }
        // 获取中心点
        findPositionPath[0] = placingPieces.lattice.latticeX;
        findPositionPath[1] = placingPieces.lattice.latticeY;
        // 每个方向最多查找游戏的次数
        for (let modeI = 0; modeI < (gameMode - 1); modeI++) {
            // 每次查找之后没找到就继续延申
            findPositionPath[0] += findPath[findPosition].value[0];
            findPositionPath[1] += findPath[findPosition].value[1];
            // 根据findPositionPath坐标查找key
            gameModeMap = useLatticeList.get(`lattice${findPositionPath[0]}${findPositionPath[1]}`);
            // 查找点
            if (gameModeMap) {
                if (findPath[findPosition].type) {
                    findValue[findPosition].lattice.unshift(gameModeMap);
                } else {
                    findValue[findPosition].lattice.push(gameModeMap);
                }


                if (gameModeMap.value === LOCINPIECES_X) {
                    findValue[findPosition].lattice_X += 1;
                } else if (gameModeMap.value === LOCINPIECES_O) {
                    findValue[findPosition].lattice_O += 1;
                } else {
                    findValue[findPosition].lattice_init += 1;
                }
            }
        }

        findValue[findPosition].lattice_init = findValue[findPosition].lattice_init - (findValue[findPosition].lattice_O + findValue[findPosition].lattice_X);
        lattice_init += findValue[findPosition].lattice_init;
        // 判断本条线上是否有该游戏最大棋子
        if (placingPieces.value !== 0) {
            if (Array.isArray(findValue[findPosition].lattice) && (findValue[findPosition].lattice_O >= gameMode || findValue[findPosition].lattice_X >= gameMode)) {
                gameState.gameState = true;
            }
        }

        // 本次查询完成把线路反转，用以下一次查询
        findPath[findPosition].value[0] = findPath[findPosition].value[0] * -1;
        findPath[findPosition].value[1] = findPath[findPosition].value[1] * -1;
        findPath[findPosition].type = !findPath[findPosition].type;
        findPosition++;
    }
    gameState.findValue = { findValue, lattice_init };
    return gameState;
};

/**
 * ai优先落中子
 * @param latticeList 棋盘布局
 */
export const aiGetMiddle = (latticeList: ILattice[]) => {
    const getMiddlePl = parseInt(String(latticeList.length / 2));
    if (latticeList[getMiddlePl].value === 0) {
        return latticeList[getMiddlePl].id;
    }
    return -1;
};
/**
 * 游戏类型 */
export const gameType = () => [['黑', '白'], ['X', 'O']];
/**
 * 优化查找，先去除小于游戏最小查找范围的点，再去除大于最大查找范围的点。
 * */
const opDetermineLattice = (latticeList: ILattice[], gameMode: number, placingPieces: ILattice) => {
    const { lattice } = placingPieces;
    const latticeMap = new Map<string, ILattice>();
    let useDetermineUp;
    let useDetermineEnd;
    let mapKey;
    for (let latticeI = 0; latticeI < latticeList.length; latticeI++) {
        useDetermineUp = latticeList[latticeI].lattice.latticeX >= (lattice.latticeX - gameMode) &&
            latticeList[latticeI].lattice.latticeY >= (lattice.latticeY - gameMode);
        useDetermineEnd = latticeList[latticeI].lattice.latticeX <= (lattice.latticeX + gameMode) &&
            latticeList[latticeI].lattice.latticeY <= (lattice.latticeY + gameMode);
        if (useDetermineUp && useDetermineEnd) {
            mapKey = `lattice${latticeList[latticeI].lattice.latticeX}${latticeList[latticeI].lattice.latticeY}`;
            latticeMap.set(mapKey, latticeList[latticeI]);
        }
    }
    return latticeMap;
};

/**
 *自适应棋盘大小 */
export const setGameLayout = (value: number) => {
    let str = '';
    for (let strI = 0; strI < value; strI++) {
        str += ' auto';
    }
    return str;
};


/**
 * 初始化棋盘状态，根据棋盘布局生成棋盘，并赋值棋格状态为0
 * */
export const initChessboard = (lattice: IChessboard) => {
    const {
        chessboardX,
        chessboardY,
    } = lattice;
    const useLatticeList = new Array(chessboardX * chessboardY);
    let latticeX = 0;
    let latticeY = 0;
    for (let latticeI = 0; latticeI < (chessboardX * chessboardY); latticeI++) {
        if (latticeI % chessboardY === 0) {
            latticeY++;
            latticeX = 0;
        }
        latticeX++;
        useLatticeList[latticeI] = {
            id: latticeI,
            lattice: {
                latticeX,
                latticeY,
            },
            value: 0,
        };
    }
    return useLatticeList;
};
