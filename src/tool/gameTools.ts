import { InChessboard, InLattice } from '../view/home/interface/home';

/**
 * 判断游戏是否结束
 * @param chessboard 当前棋盘上所有点，以及当前选中的棋格
 * @param gameMode 游戏类型
 * @param layout 棋盘布局
 * */
export const determineLattice = (chessboard: { placingPieces:InLattice, latticeList:InLattice[] }, gameMode:number, layout:InChessboard) => {
    const { placingPieces, latticeList } = chessboard;
    const useGameMode = gameMode;
    const { chessboardX, chessboardY } = layout;
    // 定义查询的四条线
    const findPath = [
        { id: 0, value: [-1, -1] },
        { id: 1, value: [0, -1] },
        { id: 2, value: [1, -1] },
        { id: 3, value: [-1, 0] },
    ];
    // 用于获取各条findPath里的数据，在查询完前4条后归0开始反方向查找
    let findPosition = 0;
    // 临时存储点击的点位8个方向上的点，用于判断是否相同
    const findPositionPath = [0, 0];
    // 存储每条线上的相同棋子各有多少
    const findValue:InLattice[][] = [[], [], [], []];
    // 优化查找的范围
    const useLatticeList = opDetermineLattice(latticeList, gameMode, placingPieces, layout);
    // 先将点击的点存入findValue
    for (let positionI = 0; positionI < findValue.length; positionI++) {
        findValue[positionI].push(placingPieces);
    }
    let findPathStart; let forLattice;
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
        forGameMode:for (let modeI = 0; modeI < (gameMode - 1); modeI++) {
            // 每次查找之后没找到就继续延申
            findPositionPath[0] += findPath[findPosition].value[0];
            findPositionPath[1] += findPath[findPosition].value[1];
            // 查找点
            for (let latticeI = 0; latticeI < useLatticeList.length; latticeI++) {
                // 如果到顶直接返回继续另一边查找
                if (findPositionPath[0] < 1 || findPositionPath[0] > chessboardX) break forGameMode;
                if (findPositionPath[1] < 1 || findPositionPath[0] > chessboardY) break forGameMode;
                // 判断是否点位是否在查找的线上
                forLattice = useLatticeList[latticeI].lattice;
                findPathStart = (forLattice.latticeX === findPositionPath[0] &&
                        forLattice.latticeY === findPositionPath[1]);
                if (findPathStart) {
                    // 判断是否是同一类型棋子
                    if (useLatticeList[latticeI].value === placingPieces.value) {
                        findValue[findPosition].push(useLatticeList[latticeI]);
                    } else {
                        break forGameMode;
                    }
                }
            }
        }
        // 判断本条线上是否有该游戏最大棋子
        if (Array.isArray(findValue[findPosition]) && findValue[findPosition].length >= useGameMode) {
            return true;
        }
        // 本次查询完成把线路反转，用以下一次查询
        findPath[findPosition].value[0] = findPath[findPosition].value[0] * -1;
        findPath[findPosition].value[1] = findPath[findPosition].value[1] * -1;
        findPosition++;
    }
    return false;
};
/**
 * 游戏类型 */
export const gameType = () => [['黑', '白'], ['X', 'O']];
/**
 * 优化查找，先去除小于游戏最小查找范围的点，再去除大于最大查找范围的点。
 * */
const opDetermineLattice = (latticeList:InLattice[], gameMode:number, placingPieces:InLattice, layout:InChessboard) => {
    let optimizeListStart = [];
    const { lattice } = placingPieces;
    let useDetermineUp; let useDetermineEnd;
    for (let latticeI = 0; latticeI < latticeList.length; latticeI++) {
        useDetermineUp =  latticeList[latticeI].lattice.latticeX >= (lattice.latticeX - gameMode) &&
            latticeList[latticeI].lattice.latticeY >= (lattice.latticeY - gameMode);
        useDetermineEnd = latticeList[latticeI].lattice.latticeX <= (lattice.latticeX + gameMode) &&
            latticeList[latticeI].lattice.latticeY <= (lattice.latticeY + gameMode);
        if (useDetermineUp && useDetermineEnd) {
            optimizeListStart.push(latticeList[latticeI]);
        }
    }
    if (layout.chessboardX / 2 < lattice.latticeX || layout.chessboardY / 2 < lattice.latticeY) {
        optimizeListStart = optimizeListStart.reverse();
    }
    return optimizeListStart;
};

/**
 *自适应棋盘大小 */
export const setGameLayout = (value:number) => {
    let str = '';
    for (let strI = 0; strI < value; strI++) {
        str += ' auto';
    }
    return str;
};


/**
 * 初始化棋盘状态，根据棋盘布局生成棋盘，并赋值棋格状态为0
 * */
export const initChessboard = (lattice:InChessboard) => {
    const { chessboardX, chessboardY } = lattice;
    const useLatticeList = new Array(chessboardX * chessboardY);
    let latticeX = 0; let latticeY = 0;
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
