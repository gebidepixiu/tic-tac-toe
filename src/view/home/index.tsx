import React from 'react';
import GameTitle from './component/GameTitle';
import GameHitory from './component/GameHitory';
import '../../assets/css/home.css';
import { aiGetMiddle, determineLattice, initChessboard, setGameLayout } from '../../tool/gameTools';
import GameLattice from './component/GameLattice';
import GameType from './component/GameType';
import {
    EGameMode,
    EGameStart,
    EGameType,
    ELayout,
    EPlacingPieces,
    GAME_INIT,
    IChessboard,
    ILattice
} from './interface/home';

import store from '../../store/store';
import { setGameHitory } from '../../store/homeReducer';
import GameAIStart from './component/GameAIStart';

const {
    FIRST_LOYOUT,
    SECOND_LOYOUT,
} = ELayout;
const {
    FIRST_MODE,
    SECOND_MODE,
} = EGameMode;
const {
    GAME_DRAW,
    GAME_START,
} = EGameStart;
const {
    FIRST_TYPE,
    SECOND_TYPE,
} = EGameType;
const {
    LOCINPIECES_INIT,
    LOCINPIECES_X,
    LOCINPIECES_O,
} = EPlacingPieces;

interface IHome {
    // 棋盘
    chessboard: ILattice[];
    // 布局
    layout: IChessboard;
    // 游戏状态
    gameStart: number;
    // 游戏类型
    gameType: number;
    // 棋手
    placingPiecesType: number;
    // 当前落子人
    placingPieces: number;
}

/**
 * @description 五子棋游戏主入口
 **/
class Home extends React.Component<{}, IHome> {
    // 记录上一步附近附近同类型落子位置
    constructor (props: {}) {
        super(props);
        this.state = {
            chessboard: [],
            layout: {
                chessboardX: FIRST_MODE,
                chessboardY: FIRST_MODE,
                gameMode: FIRST_MODE,
            },
            gameStart: GAME_START,
            gameType: SECOND_TYPE,
            placingPieces: -1,
            placingPiecesType: LOCINPIECES_X,
        };
    }

    /**
     * 设置历史记录，改变棋子样式
     * @param value 点击棋子的id/下标
     **/
    onLatticeClick = (value: number) => {
        if (this.state.chessboard[value].value !== LOCINPIECES_INIT ||
            this.state.gameStart !== GAME_START) return;
        const useLatticeList = new Array(this.state.chessboard.length);
        const myHitory = store.getState().homeReducer.gameHitory;
        // 储存入历史记录
        this.state.chessboard.forEach((value, index: number) => {
            useLatticeList[index] = {
                id: value.id,
                lattice: value.lattice,
                value: value.value,
            };
        });
        const useChessboard = useLatticeList;

        // 设置落子人
        useChessboard[value].value = this.state.placingPiecesType;
        // 设置历史记录
        store.dispatch(setGameHitory([...myHitory, useChessboard[value]]));
        // 修改下一步落子人
        this.setState({
            chessboard: useChessboard,
            placingPieces: useChessboard[value].id,
            placingPiecesType: this.state.placingPiecesType === LOCINPIECES_X
                ? LOCINPIECES_O : LOCINPIECES_X,
        });
    };
    /**
     * 重置历史记录/回退游戏进程
     * @param value 需要重置到哪步的落子状态
     * @param index 需要重置到哪步的下标
     **/
    setHitory = (value: ILattice, index: number) => {
        const myHitory = store.getState().homeReducer.gameHitory;
        const useHitory = myHitory.slice(index);
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI < this.state.chessboard.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (useHitory[hitoryI].id === this.state.chessboard[latticeI].id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI],
                        value: LOCINPIECES_INIT,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(this.state.chessboard[latticeI]);
        }
        // 回退历史记录
        this.setState({
            chessboard: useLatticeList,
            placingPiecesType: value.value,
            gameStart: GAME_START,
            placingPieces: index === 0 ? -1 : myHitory[index - 1].id,
        });
        store.dispatch(setGameHitory(myHitory.slice(0, index)));
    };

    /**
     * @description 切换游戏类型
     **/
    onSetGameType = () => {
        const useGameLayout = this.state.gameType === FIRST_TYPE ? FIRST_LOYOUT : SECOND_LOYOUT;
        const useGameMode = this.state.gameType === FIRST_TYPE ? SECOND_TYPE : FIRST_TYPE;
        const gameMode = this.state.layout.gameMode === SECOND_MODE ? FIRST_MODE : SECOND_MODE;
        this.setState({
            layout: {
                chessboardX: useGameLayout,
                chessboardY: useGameLayout,
                gameMode,
            },
        });
        this.setState({ gameType: useGameMode });
    };

    /**
     * @description 初始化或者切换游戏
     **/
    initOrSwitch = (layout?: IChessboard) => {
        this.setState({
            gameStart: GAME_START,
            placingPiecesType: LOCINPIECES_X,
            placingPieces: GAME_INIT,
            chessboard: initChessboard(layout || this.state.layout),
        });
        store.dispatch(setGameHitory([]));
    };

    /**
     * @description 判断胜负
     **/
    fallingChess = (newState: IHome) => {
        const {
            chessboard,
            layout,
            placingPieces,
        } = newState;
        const { gameHitory } = store.getState().homeReducer;
        if (placingPieces !== GAME_INIT) {
            let winner;
            // 判断是否有人胜出
            const gameState = determineLattice({
                latticeList: chessboard,
                placingPieces: chessboard[placingPieces],
            }, layout);
            if (gameState.gameState) {
                winner = chessboard[placingPieces].value;
            } else {
                winner = GAME_DRAW;
                // 判断游戏是否平局
                if (gameHitory.length !== chessboard.length) {
                    winner = GAME_START;
                }
            }
            if (winner !== GAME_START) {
                this.setState({ gameStart: winner });
                return;
            }
            // ai落子
            if (chessboard[placingPieces].value === LOCINPIECES_X && gameState.currentPlId !== -1) {
                setTimeout(() => {
                    this.onLatticeClick(gameState.currentPlId);
                }, 1000);
            }
        }
    };
    /**
     * @description AI先手
     **/
    onAIStart = () => {
        const aiStart = aiGetMiddle(this.state.chessboard);
        if (aiStart < 0) return;
        this.setState({ placingPiecesType: LOCINPIECES_O }, () => {
            this.onLatticeClick(aiStart);
        });
    };
    // 初始化
    componentDidMount () {
        this.initOrSwitch();
    }

    // 更新状态
    shouldComponentUpdate (nextProps: unknown, nextStates: IHome) {
        if (nextStates.layout.chessboardX !== this.state.layout.chessboardX) {
            this.initOrSwitch(nextStates.layout);
        }
        if (nextStates.placingPieces !== this.state.placingPieces) {
            this.fallingChess(nextStates);
        }
        return true;
    }

    render () {
        const myHitory = store.getState().homeReducer.gameHitory;
        return (
            <div className={'Home'}>
                <header>
                    <GameTitle placingPieces={this.state.placingPiecesType} gameType={this.state.gameType}
                        gameStart={this.state.gameStart}/>
                </header>
                <aside>
                    <GameType onSetGameType={this.onSetGameType}/>
                    <GameAIStart onAIStart={this.onAIStart}/>
                </aside>
                <main>
                    <ul className={'gameList'}
                        style={{ gridTemplateColumns: setGameLayout(this.state.layout.chessboardX) }}>
                        {this.state.chessboard.map((value: ILattice) => {
                            return (
                                <GameLattice
                                    key={value.id}
                                    lattice={value}
                                    gameType={this.state.gameType}
                                    onLatticeClick={this.onLatticeClick}
                                />
                            );
                        })}
                    </ul>
                </main>
                <footer className={'gameHitory'}>
                    {
                        myHitory.map((value, index: number) => {
                            return (
                                <GameHitory
                                    key={value.id}
                                    useIndex={index}
                                    gameHitory={value}
                                    setHitory={this.setHitory}
                                />
                            );
                        })
                    }
                </footer>
            </div>
        );
    }
}

export default Home;
