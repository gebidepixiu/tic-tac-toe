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
/**
 * 五子棋游戏
 * */
const Home = () => {
    const [chessboard, setChessboard] = useState<{placingPieces:InLattice, latticeList:InLattice[]}>({
        placingPieces: {
            id: -1,
            value: -1,
            lattice: {
                latticeX: -1,
                latticeY: -1,
            },
        }, latticeList: [],
    });
    // 棋盘布局
    const [layout, setLayout] = useState({ chessboardX: 8, chessboardY: 8 });
    // 储存/设置历史记录
    const { gameHitory }:{gameHitory:InLattice[]} = useSelector((state:{homeReducer:{gameHitory:[]}}) => state.homeReducer);
    const dispatch = useDispatch();
    // 设置游戏状态0继续游戏/-1游戏平局/（1/2）胜利者
    const [gameStart, setGameStart] = useState(-1);
    // 游戏类型/用于改变样式
    const [gameType, setGameType] = useState(0);
    // 设置游戏类型
    const [gameMode, setGameMode] = useState(5);
    // 判断落子人
    const [placingPieces, setPlacingPieces] = useState(false);
    // 判断游戏平局
    const [determineGameStart, setDetermineGameStart] = useState(0);
    /** 设置历史记录，改变棋子样式 */
    // const onLatticeClick = (value:number) => {
    //     if (chessboard.latticeList[value].value !== 0 || gameStart !== 0) return;
    //     const useLatticeList = new Array(chessboard.latticeList.length);
    //     // 储存入历史记录
    //     chessboard.latticeList.forEach((value, index:number) => {
    //         useLatticeList[index] = {
    //             id: value.id,
    //             lattice: value.lattice,
    //             value: value.value,
    //         };
    //     });
    //     const useChessboard = {
    //         placingPieces: {
    //             id: -1,
    //             value: -1,
    //             lattice: {
    //                 latticeX: -1,
    //                 latticeY: -1,
    //             },
    //         },
    //         latticeList: useLatticeList,
    //     };
    //     // 设置落子人
    //     useChessboard.latticeList[value].value = placingPieces ? 1 : 2;
    //     useChessboard.placingPieces = useChessboard.latticeList[value];
    //
    //     // 设置历史记录
    //     // setGameHitory([...gameHitory, useChessboard.latticeList[value]]);
    //     dispatch(setGameHitory([...gameHitory, useChessboard.latticeList[value]]));
    //     // 修改下一步落子人
    //     setPlacingPieces(!placingPieces);
    //     // 修改棋盘
    //     setChessboard(useChessboard);
    //     setDetermineGameStart(determineGameStart + 1);
    // };
    /**
     * 重置历史记录/回退游戏进程 */
    const setHitory = (value:InLattice, index:number) => {
        const useHitory = gameHitory.slice(index);
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI < chessboard.latticeList.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (useHitory[hitoryI].id === chessboard.latticeList[latticeI].id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI],
                        value: 0,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(chessboard.latticeList[latticeI]);
        }
        setChessboard({
            placingPieces: index === 0 ? {
                id: -1,
                value: -1,
                lattice: {
                    latticeX: -1,
                    latticeY: -1,
                },
            } : gameHitory[index - 1],
            latticeList: useLatticeList,
        });
        setPlacingPieces(value.value === 1);
        // setGameHitory();
        dispatch(setGameHitory(gameHitory.slice(0, index)));
        setGameStart(0);
        setDetermineGameStart((determineGameStart - (gameHitory.length - index)));
    };
    /**
     * 切换游戏类型 */
    const onSetGameType = () => {
        const useGameLayout = gameType === 0 ? 3 : 8;
        const useGameMode = gameType === 0;
        setLayout({ chessboardX: useGameLayout, chessboardY: useGameLayout });
        setGameMode(useGameMode ? 3 : 5);
        setGameType(useGameMode ? 1 : 0);
    };
    // 判断胜负
    useEffect(() => {
        if (chessboard.placingPieces.id !== -1) {
            let winner;
            // 判断是否有人胜出
            const gameStart = determineLattice(chessboard, gameMode);
            if (gameStart) {
                winner = chessboard.placingPieces.value;
            } else {
                winner = -1;
                // 判断游戏是否平局
                if (determineGameStart !== chessboard.latticeList.length) {
                    winner = 0;
                }
            }
            if (winner !== 0)setGameStart(winner);
        }
    }, [chessboard]);
    // 初始化游戏状态/切换游戏类型后的还原数据
    useEffect(() => {
        const useLatticeList = initChessboard(layout);
        setChessboard({
            ...chessboard,
            latticeList: useLatticeList,
        });
        setPlacingPieces(true);
        setGameStart(0);
        // setGameHitory();
        dispatch(setGameHitory([]));
        setDetermineGameStart(0);
    }, [gameType]);
    /***/
    const onLatticeClick = useCallback((value:number) => {
        if (chessboard.latticeList[value].value !== 0 || gameStart !== 0) return;
        const chessboards = chessboard.latticeList;
        const useLatticeList = new Array(chessboards.length);
        // 储存入历史记录
        chessboards.forEach((value:any, index:number) => {
            useLatticeList[index] = {
                id: value.id,
                lattice: value.lattice,
                value: value.value,
            };
        });
        const useChessboard = {
            placingPieces: {
                id: -1,
                value: -1,
                lattice: {
                    latticeX: -1,
                    latticeY: -1,
                },
            },
            latticeList: useLatticeList,
        };
        // 设置落子人
        useChessboard.latticeList[value].value = placingPieces ? 1 : 2;
        useChessboard.placingPieces = useChessboard.latticeList[value];

        // 设置历史记录
        // setGameHitory([...gameHitory, useChessboard.latticeList[value]]);
        dispatch(setGameHitory([...gameHitory, useChessboard.latticeList[value]]));
        // 修改下一步落子人
        setPlacingPieces(!placingPieces);
        // 修改棋盘
        setChessboard(useChessboard);
        setDetermineGameStart(determineGameStart + 1);
    }, [placingPieces]);
    return (
        <div className={'Home'}>
            <header>
                <GameTitle placingPieces={placingPieces} gameType={gameType} gameStart={gameStart}/>
            </header>
            <aside>
                <GameType onSetGameType={onSetGameType}/>
            </aside>
            <main>
                <ul className={'gameList'} style={{ gridTemplateColumns: setGameLayout(layout.chessboardX) }}>
                    {chessboard.latticeList.map((value:InLattice) => {
                        return (
                            <GameLattice
                                key={value.id}
                                latticeId={value.id}
                                latticeValue={value.value}
                                gameType={gameType}
                                onLatticeClick={onLatticeClick}
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
