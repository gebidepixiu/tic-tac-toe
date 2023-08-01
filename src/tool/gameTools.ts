import { IChessboard, ILattice, EPlacingPieces } from '../view/home/interface/home';

const {
    LOCINPIECES_X,
    LOCINPIECES_O,
} = EPlacingPieces;

/**
 * 落子后返回落子点附近的属性
 * @param gameState 设置游戏状态是否结束游戏
 * @param findValue 每条线的数据
 * @param currentPlId 设置ai可以点击的点
 */
interface IGameState {
    // 设置游戏状态是否结束游戏
    gameState: boolean;
    // 每条线的数据
    findValue?: IGameFindValue;
    // 设置ai可以点击的点
    currentPlId: number;
}
/**
 * 每条线的棋子统计数据
 * @param findValue 棋盘每条线的数据
 * @param lattice_init 落子点周围上未落子出现的统计
 * @param lattice_X 落子点周围上X子出现的统计
 * @param lattice_O 落子点周围上O子出现的统计
 */
interface IGameFindValue{
    // 棋盘每条线的数据
    findValue: IFindValue[];
    // 单条线上未落子出现的统计
    lattice_init: number;
    // 单条线上X子出现的统计
    lattice_X: number;
    // 单条线上O子出现的统计
    lattice_O: number;
}
/**
 * 棋子单条线周围各类型棋子统计
 * @param lattice 棋盘每条线的数据
 * @param lattice_X 单条线上X子出现的统计
 * @param lattice_O 单条线上O子出现的统计
 * @param lattice_init 单条线上未落子出现的统计
 */
interface IFindValue {
    // 每个落子点上每条线的数据
    lattice: ILattice[];
    // 单条线上X子出现的统计
    lattice_X: number;
    // 单条线上O子出现的统计
    lattice_O: number;
    // 单条线上未落子出现的统计
    lattice_init: number;
}
/**
 * 游戏查询的8个角度
 * @param id 下标
 * @param value 落子后需要遍历线的角度
 * @param type 向上遍历/向下遍历
 */
interface IUseFindPath {
    id: number;
    // 落子后需要遍历线的角度
    value: number[];
    // 向上遍历/向下遍历
    type: boolean;
}

// 定义查询的落子点的8条角度
const useFindPath: IUseFindPath[] = [
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
 * @param aiType ai棋手
 */
export const determineLattice = (chessboard: { placingPieces: ILattice, latticeList: ILattice[] }, layout: IChessboard, aiType:number) => {
    const {
        placingPieces,
        latticeList,
    } = chessboard;
    const { gameMode } = layout;

    let gameState: IGameState = {
        gameState: false,
        currentPlId: -1,
    };
    // 优化查找的范围
    const useLatticeList = opDetermineLattice(latticeList, gameMode, placingPieces);
    // 是否胜利判断
    gameState = selectLattic(placingPieces, gameMode, useLatticeList, gameState);
    if (gameState.gameState) return gameState;
    if (placingPieces.value !== aiType) {
        const useCurrentPlId = aiGetMiddle(latticeList);
        if (useCurrentPlId !== -1) {
            gameState.currentPlId = useCurrentPlId;
        } else {
            gameState.currentPlId = aiSelect(placingPieces, gameMode, useLatticeList, aiType).currentPlId;
        }
        gameState.gameState = false;
    }
    return gameState;
};

/**
 * ai判断落子
 * @param placingPieces // 当前落子
 * @param gameMode // 棋盘游戏最大连接数量
 * @param useLatticeList // 棋盘信息
 * @param aiType // ai棋手
 */
const aiSelect = (placingPieces: ILattice, gameMode: number, useLatticeList: Map<string, ILattice>, aiType:number) => {
    const aILatticeX = aiType === LOCINPIECES_X ? 'lattice_X' : 'lattice_O';
    const aILatticeY = aiType === LOCINPIECES_X ? 'lattice_O' : 'lattice_X';
    let maxLattice: IGameFindValue = {
        findValue: [],
        lattice_init: -1,
        lattice_X: -1,
        lattice_O: -1,
    };
    // 获取棋盘每个子之间黑白子个数
    const gameState: IGameState = {
        // 设置游戏状态是否结束游戏
        gameState: false,
        // 设置ai可以点击的点
        currentPlId: -1,
    };
    let latticeSelectAll: IGameState = {
        gameState: false,
        // 设置ai可以点击的点
        currentPlId: -1,
    };
    let maxLatticeY = -1;
    // 循环棋盘
    latticeListOf:for (const useLatticeListKeyKey of useLatticeList.values()) {
        if (useLatticeListKeyKey.value !== 0) continue;
        latticeSelectAll = selectLattic(useLatticeListKeyKey, gameMode, useLatticeList, gameState);
        if (typeof latticeSelectAll.findValue?.findValue !== 'undefined') {
            const { findValue } = latticeSelectAll;
            for (let sI = 0; sI < findValue.findValue.length; sI++) {
                // 优先找ai能够连线的点
                if (findValue.findValue[sI][aILatticeX] === (gameMode - 1)) {
                    maxLatticeY =  -1;
                    latticeSelectAll.currentPlId = useLatticeListKeyKey.id;
                    break latticeListOf;
                }
                // 其次找玩家能够连线的点
                if (findValue.findValue[sI][aILatticeY] === (gameMode - 1)) {
                    maxLatticeY = useLatticeListKeyKey.id;
                }
            }
            if (maxLattice.findValue.length === 0) {
                maxLattice = findValue;
                latticeSelectAll.currentPlId = useLatticeListKeyKey.id;
                continue;
            }
            /**
             * 最后通过统计找出最优的落子点，先找已经落子的点位统计，拿到同类型最多的点
             * 如果另一个点有一样多的黑白子，就比较周边空位，空位多的就是最优点
             * 如果空位一样的话就比较谁黑白子，找出统计棋子最少的点
             */
            if (findValue[aILatticeX] >= maxLattice[aILatticeX] && findValue[aILatticeY] <= maxLattice[aILatticeY]) {
                if (findValue.lattice_init < maxLattice.lattice_init) {
                    maxLattice = findValue;
                    latticeSelectAll.currentPlId = useLatticeListKeyKey.id;
                }
            }
        }
    }
    if (maxLatticeY !== -1)latticeSelectAll.currentPlId = maxLatticeY;
    return latticeSelectAll;
};

/**
 * 查询传入棋子周边最长gameMode上有多少条同类型棋子
 * @param placingPieces //需要查找的点
 * @param gameMode //最长查找路线
 * @param useLatticeList //当前查找的棋盘
 * @param gameState //查找后的状态
 */
const selectLattic = (placingPieces: ILattice, gameMode: number, useLatticeList: Map<string, ILattice>, gameState: IGameState) => {
    // 用于获取各条findPath里的数据，在查询完前4条后归0开始反方向查找
    let findPosition = 0;
    // 临时存储点击的点位8个方向上的点，用于判断是否相同
    const findPositionPath = [0, 0];
    // 定义查询的四条线
    const findPath = [];
    // 存储每条线上的相同棋子各有多少
    const findValue: IFindValue[] = [];
    // 统计传入点位上八条边各棋子类型统计
    const lattice_count: {
        // 统计所有未落子的点
        lattice_init: number;
        // 统计所有O的点
        lattice_O: number;
        // 统计所有X的点
        lattice_X: number;
    } = {
        lattice_init: 0,
        lattice_O: 0,
        lattice_X: 0,
    };
    for (let fI = 0; fI < useFindPath.length; fI++) {
        findPath.push(useFindPath[fI]);
    }
    let gameModeMap;
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
        // 获取棋盘8个方向未落子的点减去已经落子的点，获取八条边上有更多空位的点位
        findValue[findPosition].lattice_init = findValue[findPosition].lattice_init - (findValue[findPosition].lattice_O + findValue[findPosition].lattice_X);
        lattice_count.lattice_init += findValue[findPosition].lattice_init;
        // 每个棋子8条边上总共有x，o子多少个
        lattice_count.lattice_O += findValue[findPosition].lattice_O;
        lattice_count.lattice_X += findValue[findPosition].lattice_X;
        // 判断本条线上是否有该游戏最大棋子
        if (placingPieces.value !== 0) {
            if (Array.isArray(findValue[findPosition].lattice) && (findValue[findPosition].lattice_O >= gameMode || findValue[findPosition].lattice_X >= gameMode)) {
                gameState.gameState = true;
                break;
            }
        }
        // 本次查询完成把线路反转，用以下一次查询
        findPath[findPosition].value[0] = findPath[findPosition].value[0] * -1;
        findPath[findPosition].value[1] = findPath[findPosition].value[1] * -1;
        findPath[findPosition].type = !findPath[findPosition].type;
        findPosition++;
    }
    gameState.findValue = { findValue, ...lattice_count };
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
 * 游戏类型
 */
export const gameType = () => [['黑', '白'], ['X', 'O']];
/**
 * 优化查找，先去除小于游戏最小查找范围的点，再去除大于最大查找范围的点。
 */
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
 *自适应棋盘大小
 */
export const setGameLayout = (value: number) => {
    let str = '';
    for (let strI = 0; strI < value; strI++) {
        str += ' auto';
    }
    return str;
};


/**
 * 初始化棋盘状态，根据棋盘布局生成棋盘，并赋值棋格状态为0
 */
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
