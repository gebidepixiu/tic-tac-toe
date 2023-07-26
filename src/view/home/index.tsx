import React, { useCallback, useEffect, useState } from 'react';
import GameTitle from './component/GameTitle';
import GameHitory from './component/GameHitory';
import '../../assets/css/home.css';
import { determineLattice, initChessboard, setGameLayout } from '../../tool/gameTools';
import GameLattice from './component/GameLattice';
import GameType from './component/GameType';
import { InLattice } from './interface/home';
import { useSelector, useDispatch } from 'react-redux';
import { setGameHitory } from '../../store/homeReducer';
import {
    EGameMode, EGameStart, EGameType, ELayout, EPlacingPieces, GAME_INIT
} from './constant/home';

const { FIRST_LOYOUT, SECOND_LOYOUT } = ELayout;// 游戏布局
const { FIRST_MODE, SECOND_MODE } = EGameMode;// 游戏
const { GAME_DRAW, GAME_START } = EGameStart;// 游戏状态
const { FIRST_TYPE, SECOND_TYPE } = EGameType;// 游戏类型
const { LOCINPIECES_INIT, LOCINPIECES_X, LOCINPIECES_O } = EPlacingPieces;// 棋手
const UseGameLattice = React.memo(GameLattice);
/**
 * 五子棋游戏
 * */
const Home = () => {
    // 棋盘布局
    const [layout, setLayout] = useState({
        chessboardX: SECOND_LOYOUT,
        chessboardY: SECOND_LOYOUT,
        gameMode: SECOND_MODE,
    });
    // 棋盘
    const [chessboard, setChessboard] = useState<InLattice[]>(initChessboard(layout));
    // 储存/设置历史记录
    const { gameHitory }:{gameHitory:InLattice[]} = useSelector((state:{homeReducer:{gameHitory:[]}}) => state.homeReducer);
    const dispatch = useDispatch();
    // 设置游戏状态0继续游戏/-1游戏平局/（1/2）胜利者
    const [gameStart, setGameStart] = useState(GAME_DRAW);
    // 游戏类型/用于改变样式
    const [gameType, setGameType] = useState(FIRST_TYPE);
    // 获取当前的落子人
    const [placingPieces, setPlacingPieces] = useState(GAME_START);
    // 落子人
    const [placingPiecesType, setPlacingPiecesType] = useState(LOCINPIECES_X);
    /** 设置历史记录，改变棋子样式 */
    const onLatticeClick = (value:number) => {
        if (chessboard[value].value !== LOCINPIECES_INIT || gameStart !== GAME_START) return;
        const useLatticeList = new Array(chessboard.length);
        // 储存入历史记录
        chessboard.forEach((value, index:number) => {
            useLatticeList[index] = {
                id: value.id,
                lattice: value.lattice,
                value: value.value,
            };
        });
        const useChessboard = useLatticeList;
        // 设置落子人
        useChessboard[value].value = placingPiecesType;
        setPlacingPiecesType(placingPiecesType === LOCINPIECES_X ? LOCINPIECES_O : LOCINPIECES_X);
        // 设置历史记录
        dispatch(setGameHitory([...gameHitory, useChessboard[value]]));
        // 修改棋盘
        setChessboard(useChessboard);
    };
    /**
     * 重置历史记录/回退游戏进程 */
    const setHitory = (value:InLattice, index:number) => {
        const useHitory = gameHitory.slice(index);
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI < chessboard.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (useHitory[hitoryI].id === chessboard[latticeI].id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI],
                        value: LOCINPIECES_INIT,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(chessboard[latticeI]);
        }
        setChessboard(useLatticeList);
        setPlacingPieces(gameHitory[index - 1].id);
        setPlacingPiecesType(value.value);
        dispatch(setGameHitory(gameHitory.slice(0, index)));
        setGameStart(GAME_START);
    };

    /**
     * 切换游戏类型 */
    const onSetGameType = () => {
        const useGameLayout = gameType === FIRST_TYPE ? FIRST_LOYOUT : SECOND_LOYOUT;
        const useGameMode = gameType === FIRST_TYPE ? FIRST_MODE : SECOND_MODE;
        setLayout({ chessboardX: useGameLayout, chessboardY: useGameLayout, gameMode: useGameMode });
        setGameType(gameType === FIRST_TYPE ? SECOND_TYPE : FIRST_TYPE);
    };

    /***/
    const onPlacingPiecesClick = useCallback((value:number) => {
        setPlacingPieces(value);
    }, []);

    // 判断胜负
    useEffect(() => {
        if (placingPieces !== GAME_INIT) {
            let winner;
            // 判断是否有人胜出
            const gameStart = determineLattice({ placingPieces: chessboard[placingPieces], latticeList: chessboard }, layout.gameMode);
            if (gameStart) {
                winner = placingPieces;
            } else {
                winner = GAME_DRAW;
                // 判断游戏是否平局
                if (gameHitory.length !== chessboard.length) {
                    winner = GAME_START;
                }
            }
            if (winner !== GAME_START)setGameStart(winner);
        }
    }, [chessboard]);
    // 初始化游戏状态/切换游戏类型后的还原数据
    useEffect(() => {
        const useLatticeList = initChessboard(layout);
        setChessboard(useLatticeList);
        setPlacingPieces(GAME_INIT);
        setGameStart(GAME_START);
        setPlacingPiecesType(LOCINPIECES_X);
        dispatch(setGameHitory([]));
    }, [gameType]);
    // 设置棋子
    useEffect(() => {
        if (placingPieces !== GAME_INIT) {
            onLatticeClick(placingPieces);
        }
    }, [placingPieces]);
    return (
        <div className={'Home'}>
            <header>
                <GameTitle placingPieces={placingPiecesType} gameType={gameType} gameStart={gameStart}/>
            </header>
            <aside>
                <GameType onSetGameType={onSetGameType}/>
            </aside>
            <main>
                <ul className={'gameList'} style={{ gridTemplateColumns: setGameLayout(layout.chessboardX) }}>
                    {chessboard.map((value:InLattice) => {
                        return (
                            <UseGameLattice
                                key={value.id}
                                latticeId={value.id}
                                latticeValue={value.value}
                                gameType={gameType}
                                onLatticeClick={onPlacingPiecesClick}
                            />
                        );
                    })}
                </ul>
            </main>
            <footer className={'gameHitory'}>
                {
                    gameHitory.map((value, index:number) => {
                        return (
                            <GameHitory
                                key={index}
                                useIndex={index}
                                gameHitory={value}
                                setHitory={setHitory}
                            />
                        );
                    })
                }
            </footer>
        </div>
    );
};
export default Home;
