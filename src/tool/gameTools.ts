import { IChessboard, ILattice, EPlacingPieces } from '../view/home/interface/home';


const { LOCINPIECES_X } = EPlacingPieces;

interface IGameState {
    gameState: boolean;
    backPlList: ILattice[][];
    currentPlId: number;
}

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
// 存放所有能赢的下标
const victoriesPl = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

/**
 * 判断游戏是否结束
 * @param chessboard 当前棋盘上所有点，以及当前选中的棋格
 * @param layout 棋盘布局
 * @param backPlList 上一次ai落子
 * */
export const determineLattice = (chessboard: { placingPieces: ILattice, latticeList: ILattice[] }, layout: IChessboard, backPlList: Array<ILattice[]>) => {
    const {
        placingPieces,
        latticeList,
    } = chessboard;
    const { gameMode } = layout;
    // 定义查询的四条线
    const findPath = [];
    for (let fI = 0; fI < useFindPath.length; fI++) {
        findPath.push(useFindPath[fI]);
    }
    // 用于获取各条findPath里的数据，在查询完前4条后归0开始反方向查找
    let findPosition = 0;
    // 临时存储点击的点位8个方向上的点，用于判断是否相同
    const findPositionPath = [0, 0];
    // 存储每条线上的相同棋子各有多少
    const findValue: ILattice[][] = [[], [], [], []];
    // 优化查找的范围
    const useLatticeList = opDetermineLattice(latticeList, gameMode, placingPieces);
    // 先将点击的点存入findValue
    for (let positionI = 0; positionI < findValue.length; positionI++) {
        findValue[positionI].push(placingPieces);
    }
    let gameModeMap;
    const gameState: IGameState = {
        // 设置游戏状态是否结束游戏
        gameState: false,
        // 设置获取上次ai点击之后的所有可能赢的点位
        backPlList: [],
        // 设置ai可以点击的点
        currentPlId: -1,
    };
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
            if (gameModeMap && gameModeMap.value === placingPieces.value) {
                if (findPath[findPosition].type) {
                    findValue[findPosition].unshift(gameModeMap);
                } else {
                    findValue[findPosition].push(gameModeMap);
                }
            }
        }
        // 判断本条线上是否有该游戏最大棋子
        if (Array.isArray(findValue[findPosition]) && findValue[findPosition].length >= gameMode) {
            gameState.gameState = true;
            return gameState;
        }
        // 本次查询完成把线路反转，用以下一次查询
        findPath[findPosition].value[0] = findPath[findPosition].value[0] * -1;
        findPath[findPosition].value[1] = findPath[findPosition].value[1] * -1;
        findPath[findPosition].type = !findPath[findPosition].type;
        findPosition++;
    }
    gameState.backPlList = findValue;
    if (placingPieces.value === LOCINPIECES_X) {
        // aiGame(backPlList, findValue, layout, useLatticeList);
        // 获取ai的落子点
        gameState.currentPlId = aiSelect(findValue, backPlList, layout, latticeList);
        gameState.gameState = false;
    }
    return gameState;
};
/**
 * ai判断落子
 * @param findValue 当前黑子落子的所有连子棋
 * @param backPlList 上一次ai落子的所有连子棋
 * @param layout 棋盘布局
 * @param latticeList 当前棋盘上所有点，以及当前选中的棋格
 */
const aiSelect = (findValue: Array<ILattice[]>, backPlList: Array<ILattice[]>, layout: IChessboard, latticeList: ILattice[]) => {
    // 获取ai所有可能赢的连线点位
    const useFindValue = findValue.filter((start: ILattice[]) => start.length === (layout.gameMode - 1));
    let useBackPlList: Array<ILattice[]> = [];
    // 获取玩家所有可能赢的连线点位
    if (backPlList && backPlList.length > 1) {
        useBackPlList = backPlList.filter((start: ILattice[]) => start.length === (layout.gameMode - 1));
    }
    const useVictoriesPl = victoriesPl.slice();
    // 存放所有可能连线的数组
    const plList: Array<ILattice[]> = [];
    // 优先判断白子是否有连续的
    if (useBackPlList.length > 0 && useBackPlList[0].length > 1) {
        plList.push(...useBackPlList);
    }
    // 其次判断黑子是否有连续
    if (useFindValue.length > 0 && useFindValue[0].length > 1) {
        plList.push(...useFindValue);
    }
    // 循环每条线优先查找ai先胜利的点
    if (plList.length > 0) {
        let useReduce1 = [];
        plListFor:for (let pI = 0; pI < plList.length; pI++) {
            useReduce1 = [];
            for (let fI = 0; fI < useVictoriesPl.length; fI++) {
                // 去重获取最后一个没被点击的点位给到ai
                useReduce1 = useVictoriesPl[fI].filter((val) => val !== plList[pI][0].id);
                useReduce1 = useReduce1.filter((val) => val !== plList[pI][1].id);
                if (useReduce1.length === 1) {
                    if (latticeList[useReduce1[0]].value === 0) {
                        return useReduce1[0];
                    }
                    continue plListFor;
                }
            }
        }
    }
    // 如果没有连续棋子就优先找中间位置
    const getMiddlePl = aiGetMiddle(latticeList);
    if (getMiddlePl !== -1) {
        return getMiddlePl;
    }
    // 其次从头生成
    for (let cI = 0; cI < latticeList.length; cI++) {
        if (latticeList[cI].value === 0) {
            return latticeList[cI].id;
        }
    }
    return -1;
};
/**
 * ai优先落中子
 * @param latticeList 棋盘布局
 */
export const aiGetMiddle = (latticeList:ILattice[]) => {
    const getMiddlePl = parseInt(String(latticeList.length / 2));
    if (latticeList[getMiddlePl].value === 0) {
        return latticeList[getMiddlePl].id;
    }
    return -1;
};


/**
 *
 * @param backPlList 获取AI落子的周边同类型棋子位置集合
 * @param currentPlList 获取真人落子的周边同类型棋子位置集合
 * @param gameMode 游戏结束需要连接的棋子
 */
// const aiGame = (backPlList: Array<ILattice[]> | undefined, currentPlList: any[], layout: IChessboard, useLatticeList:any) => {
//     if (typeof backPlList === 'undefined') return;
//     getMaxLength(currentPlList, layout, useLatticeList);
// };
/**
 * 获取当前数组最长点
 * @param backPlList
 * @param layout
 */
// const getMaxLength = (currentPlList: Array<ILattice[]>, layout: IChessboard, useLatticeList:any) => {
//     let currentDirection = [];
//     const currentLattice: ICoordinate = {
//         latticeX: -1,
//         latticeY: -1,
//     };
//     let findLattice:ICoordinate;
//     let plattice:any;
//     for (let bI = 0; bI < currentPlList.length; bI++) {
//         if (currentPlList[bI].length === (layout.gameMode - 2)) {
//             // 获取当前连子最长的查询方向
//             currentDirection = useFindPath[bI].value;
//             currentLattice.latticeX = currentDirection[0] + (currentPlList[bI][0].lattice.latticeX);
//             currentLattice.latticeY = currentDirection[1] + (currentPlList[bI][0].lattice.latticeY);
//
//             if (lookLength(currentLattice, layout)) {
//                 plattice = useLatticeList.get(`lattice${currentLattice.latticeX}${currentLattice.latticeY}`);
//                 if (plattice && plattice.value === 0) {
//                     findLattice = currentLattice;
//                     return findLattice;
//                 }
//             }
//             currentLattice.latticeX = (currentDirection[0] * -1) + (currentPlList[bI][currentPlList[bI].length - 1].lattice.latticeX);
//             currentLattice.latticeY = (currentDirection[1] * -1) + (currentPlList[bI][currentPlList[bI].length - 1].lattice.latticeY);
//             if (lookLength(currentLattice, layout)) {
//                 plattice = useLatticeList.get(`lattice${currentLattice.latticeX}${currentLattice.latticeY}`);
//                 if (plattice && plattice.value === 0) {
//                     findLattice = currentLattice;
//                     return findLattice;
//                 }
//             }
//         }
//     }
// };

/**
 * 判断是否在边界
 * @param useLattice
 * @param layout
 */
// const lookLength = (useLattice: ICoordinate, layout: IChessboard) => {
//     const lattice = useLattice;
//     if (lattice.latticeX < 1 || lattice.latticeX > layout.chessboardX) return false;
//     if (lattice.latticeY < 1 || lattice.latticeY > layout.chessboardY) return false;
//     return true;
// };

/**
 * 游戏类型 */
export const gameType = () => [['黑', '白'], ['X', 'O']];
/**
 * 优化查找，先去除小于游戏最小查找范围的点，再去除大于最大查找范围的点。
 * */
const opDetermineLattice = (latticeList: ILattice[], gameMode: number, placingPieces: ILattice) => {
    const { lattice } = placingPieces;
    const latticeMap = new Map();
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
