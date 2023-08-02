import { IChessboard, ILattice, EPlacingPieces } from '../view/home/interface/home';

const {
    LOCINPIECES_X,
    LOCINPIECES_O,
    LOCINPIECES_INIT,
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
 * 点落子点连接线棋子类型统计
 * @param lattice_init 落子点周围上未落子出现的统计
 * @param lattice_X 落子点周围上X子出现的统计
 * @param lattice_O 落子点周围上O子出现的统计
 */
interface ILatticeCount {
    // 单条线上未落子出现的统计
    lattice_init: number;
    // 单条线上X子出现的统计
    lattice_X: number;
    // 单条线上O子出现的统计
    lattice_O: number;
}
/**
 * 每条线的棋子统计数据
 * @param findValue 棋盘每条线的数据
 * @param lattice_init 落子点周围上未落子出现的统计
 * @param lattice_X 落子点周围上X子出现的统计
 * @param lattice_O 落子点周围上O子出现的统计
 */
interface IGameFindValue extends ILatticeCount{
    // 棋盘每条线的数据
    findValue: IFindValue[];
}

/**
 * 棋子单条线周围各类型棋子统计
 * @param lattice 棋盘每条线的数据
 * @param lattice_X 单条线上X子出现的统计
 * @param lattice_O 单条线上O子出现的统计
 * @param lattice_init 单条线上未落子出现的统计
 */
interface IFindValue extends ILatticeCount{
    // 每个落子点上每条线的数据
    lattice: ILattice[];
}
/**
 * 游戏查询的8个角度
 * @param id 下标
 * @param value 落子后需要遍历线的角度，通过加减进行延申查询
 * @param type 向上遍历/向下遍历
 */
interface IUseFindPath {
    id: number;
    // 落子后需要遍历线的角度，通过加减进行延申查询
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
 * 判断游戏是否有人胜出
 * @param chessboard 当前棋盘上所有点，以及当前选中的棋格
 * @param layout 棋盘布局
 */
export const determineLattice = (chessboard: { placingPieces: ILattice, latticeList: ILattice[] }, layout: IChessboard) => {
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
    return gameState;
};

/**
 * 存储每条线路上最优落子点的数量，当前点位信息，当前点位周边信息
 * @param maxVictory 最优落子点的数量
 * @param lattice 当前点位信息
 * @param findValue 当前点位周边信息
 */
interface IMaxVictoryList {
    // 最优落子点的数量
    maxVictory:number;
    // 当前点位信息
    lattice?:ILattice;
    // 当前点位周边信息
    findValue?:IGameFindValue;
}
/**
 * ai查询最优点位--循环useLatticeList查找未落子的点位，优先找当前使用ai的棋手是否差一个子胜利
 * 其次查询下一个棋手是否差一个子胜利，之后统计双方4条边上拟落子后下一步可以胜利的点，取出最优点位
 * 之后判断当前ai和下一步落子人中是否多个最优点位，如果当前ai有就直接落子，如果下一个落子人有多个最优点位，
 * 则进行拦截，直接找当前ai下一步可以连线的点并落子
 * 以上步骤代码由上至下，最优落子点的判断为由下至上覆盖
 * @param gameMode // 棋盘游戏最大连接数量
 * @param latticeList // 棋盘信息
 * @param placingPiecesType // 当前落子人
 */
export const aiSelect = (gameMode: number, latticeList: ILattice[], placingPiecesType:number) => {
    const aILatticeX = placingPiecesType === LOCINPIECES_X ? 'lattice_X' : 'lattice_O';
    const aILatticeY = placingPiecesType === LOCINPIECES_X ? 'lattice_O' : 'lattice_X';
    const useLatticeList = opDetermineLattice(latticeList, gameMode);
    // 获取棋盘每个子之间黑白子个数
    const gameState: IGameState = { gameState: false, currentPlId: -1 };
    let latticeSelectAll: IGameState = { gameState: false, currentPlId: -1 };
    // 存储落子后游戏结束的点位
    let maxLattice = -1;
    // 存储未落子点位的信息
    const count: IMaxVictoryList[] = [];
    // 储存当前ai和上一个落子人最优点位集合
    const { maxAi, maxPlays }: { maxAi:number[], maxPlays:number[] } = {
        maxAi: [],
        maxPlays: [],
    };
    // 统计拟落子点位上所有落子后可连接点的数量
    let maxVictory = 0;
    // 循环棋盘查询棋盘所有未落子的点位
    latticeListOf:for (const useLatticeListKey of useLatticeList.values()) {
        if (useLatticeListKey.value !== 0) continue;
        latticeSelectAll = selectLattic(useLatticeListKey, gameMode, useLatticeList, gameState);
        maxVictory = 0;
        if (typeof latticeSelectAll.findValue?.findValue !== 'undefined') {
            const { findValue } = latticeSelectAll;
            for (let sI = 0; sI < findValue.findValue.length; sI++) {
                // 优先找当前使用ai的棋手是否差一个子胜利
                if (findValue.findValue[sI][aILatticeX] === (gameMode - 1)) {
                    maxLattice = useLatticeListKey.id;
                    break latticeListOf;
                }
                // 其次查询下一个棋手是否差一个子胜利
                if (findValue.findValue[sI][aILatticeY] === (gameMode - 1)) {
                    maxLattice = useLatticeListKey.id;
                }
            }
            // 储存未落子点位上ai拟落子后有一条胜利机会的点位
            if (findValue[aILatticeX] > 0) maxVictory++;
            // 储存未落子点位上ai拟落子后有多条胜利机会的点位
            if (findValue[aILatticeX] > 1) {
                maxVictory++;
                maxAi.push(useLatticeListKey.id);
            }

            // 储存未落子点位上一个落子人拟落子后有一条胜利机会的点位
            if (findValue[aILatticeY] > 0) maxVictory++;
            // 储存未落子点位上一个落子人拟落子后有多条胜利机会的点位
            if (findValue[aILatticeY] > 1) {
                maxVictory++;
                maxPlays.push(useLatticeListKey.id);
            }
            count.push({
                maxVictory,
                lattice: useLatticeListKey,
                findValue,
            });
        }
    }
    // 判断存储最优点位
    let bestVictory:IMaxVictoryList = { maxVictory: -1 };
    for (let mI = 0; mI < count.length; mI++) {
        if (count[mI].maxVictory > bestVictory.maxVictory) {
            bestVictory = count[mI];
        } else if (count[mI].maxVictory === bestVictory.maxVictory) {
            if (count[mI].findValue!.lattice_init > bestVictory.findValue!.lattice_init) {
                bestVictory = count[mI];
            }
        }
    }
    // 如果查询上一个落子人拟落子点上的线路有多个最优点位，就避开
    if (maxPlays.length > 1) {
        for (const useLatticeListKey of useLatticeList.values()) {
            if (!maxPlays.includes(useLatticeListKey.id) && useLatticeListKey.value === LOCINPIECES_INIT) {
                bestVictory.lattice = useLatticeListKey;
                break;
            }
        }
    }
    // 如果查询上一个ai拟落子点上的线路有多个最优点位，直接落第一个最优点位
    if (maxAi.length > 1) {
        bestVictory.lattice = {
            ...bestVictory.lattice!,
            id: maxAi[0],
        };
    }

    if (bestVictory.lattice)latticeSelectAll.currentPlId = bestVictory.lattice.id;
    if (maxLattice !== -1)latticeSelectAll.currentPlId = maxLattice;
    return latticeSelectAll;
};

/**
 * 查询传入placingPieces棋子周边最长gameMode上有多少条同类型棋子
 * 拷贝useFindPath用于修改和查询落子点的各个角度，每次查询后反转当前findPath和findPath的type属性用于下次查询和按序拼接
 * 每次查询都统计当前边上各类型棋子的总数，最后根据去除当前findPath查询角度上点位集合长度小于gameMode的边
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
    const lattice_count: ILatticeCount = {
        lattice_init: 0,
        lattice_O: 0,
        lattice_X: 0,
    };
    // 拷贝查询的4条边用作修改
    for (let fI = 0; fI < useFindPath.length; fI++) {
        findPath.push(useFindPath[fI]);
    }

    let useFindValue:IFindValue = {
        lattice: [],
        lattice_init: 0,
        lattice_X: 0,
        lattice_O: 0,
    };
    // 初始化存入当前点击的棋子
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
    // 以点击中心向8条线路
    for (let findI = 0; findI < (findPath.length * 2); findI++) {
        // 切换往反方向查找
        if (findI === 4) {
            findPosition = 0;
        }
        // 获取中心点
        findPositionPath[0] = placingPieces.lattice.latticeX;
        findPositionPath[1] = placingPieces.lattice.latticeY;
        // 查询单条线路
        useFindValue = getSingleLine(gameMode, findPositionPath, findPath[findPosition], useLatticeList);

        findValue[findPosition].lattice_O += useFindValue.lattice_O;
        findValue[findPosition].lattice_init += useFindValue.lattice_init;
        findValue[findPosition].lattice_X += useFindValue.lattice_X;
        if (findPath[findPosition].type) {
            findValue[findPosition].lattice.unshift(...useFindValue.lattice);
        } else {
            findValue[findPosition].lattice.push(...useFindValue.lattice);
        }

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
    const findFilter = findValue.map((val) => {
        if (val.lattice.length >= gameMode) {
            // 储存单各方向的数据统计
            lattice_count.lattice_init += val.lattice_init;
            lattice_count.lattice_O += val.lattice_O;
            lattice_count.lattice_X += val.lattice_X;
            return val;
        }
        return {
            ...val,
            lattice: [],
        };
    });
    gameState.findValue = { findValue: findFilter, ...lattice_count };
    return gameState;
};
/**
 * 获取单条线的周边的数据---根据useFindPath向findPath方向查询最多gameMode-1个点位，并统计返回
 * @param gameMode 游戏胜利需要连接的长度
 * @param useFindPath 查询的出发点
 * @param findPath 查询的角度
 * @param useLatticeList 棋盘map集合
 */
const getSingleLine = (gameMode:number, useFindPath:number[], findPath:IUseFindPath, useLatticeList:Map<string, ILattice>):IFindValue => {
    let gameModeMap;
    const findPositionPath = useFindPath;
    const findValue:IFindValue = {
        lattice: [],
        lattice_init: 0,
        lattice_X: 0,
        lattice_O: 0,
    };
    let plValue = 0;
    // 用于获取各条findPath里的数据，在查询完前4条后归0开始反方向查找
    // 每个方向最多查找游戏的次数
    for (let modeI = 0; modeI < (gameMode - 1); modeI++) {
        // 每次查找之后没找到就继续延申
        findPositionPath[0] += findPath.value[0];
        findPositionPath[1] += findPath.value[1];
        // 根据findPositionPath坐标查找key
        gameModeMap = useLatticeList.get(`lattice${findPositionPath[0]}${findPositionPath[1]}`);
        if (gameModeMap && plValue === LOCINPIECES_INIT)plValue = gameModeMap.value;
        // 查找点
        if (gameModeMap) {
            findValue.lattice.push(gameModeMap);
            if (!(gameModeMap.value === LOCINPIECES_INIT || gameModeMap.value === plValue)) continue;
            if (gameModeMap.value === LOCINPIECES_X) {
                findValue.lattice_X += 1;
            } else if (gameModeMap.value === LOCINPIECES_O) {
                findValue.lattice_O += 1;
            } else {
                findValue.lattice_init += 1;
            }
        }
    }
    return findValue;
};
/**
 * 游戏类型
 */
export const gameType = () => [['黑', '白'], ['X', 'O']];
/**
 * 优化查找，先去除小于游戏最小查找范围的点，再去除大于最大查找范围的点。
 */
const opDetermineLattice = (latticeList: ILattice[], gameMode: number, placingPieces?: ILattice) => {
    const useLattice = placingPieces;
    const latticeMap = new Map<string, ILattice>();
    let useDetermineUp = true;
    let useDetermineEnd = true;
    let mapKey;
    for (let latticeI = 0; latticeI < latticeList.length; latticeI++) {
        if (useLattice) {
            const { lattice } = useLattice;
            useDetermineUp = latticeList[latticeI].lattice.latticeX >= (lattice.latticeX - gameMode) &&
            latticeList[latticeI].lattice.latticeY >= (lattice.latticeY - gameMode);
            useDetermineEnd = latticeList[latticeI].lattice.latticeX <= (lattice.latticeX + gameMode) &&
            latticeList[latticeI].lattice.latticeY <= (lattice.latticeY + gameMode);
        }
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
