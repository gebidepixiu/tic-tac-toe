import React from 'react';
import GameTitle from './component/GameTitle';
import GameHitory from './component/GameHitory';
import '../../assets/css/home.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { aiGetMiddle, aiSelect, determineLattice, initChessboard, setGameLayout } from '../../tool/gameTools';
import GameLattice from './component/GameLattice';
import GameType from './component/GameType';
import GameAIStart from './component/GameAIStart';
import {
    EGameMode,
    EGameType,
    ELayout,
    EPlacingPieces,
    GAME_INIT,
    IChessboard,
    ILattice
} from './interface/home';

import store from '../../store/store';
import { setGameHitory } from '../../store/homeReducer';
// import GameAIStart from './component/GameAIStart';

const {
    FIRST_LOYOUT,
    SECOND_LOYOUT,
} = ELayout;
const {
    FIRST_MODE,
    SECOND_MODE,
} = EGameMode;
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
    // 棋盘--储存棋子下标，坐标，当前落子类型
    chessboard: ILattice[];
    // 布局--棋盘长度和宽度以及游戏胜利需要的连子
    layout: IChessboard;
    // 游戏状态false为游戏结束true为开始游戏
    gameState: boolean;
    // 游戏类型0为3子棋1为5子棋
    gameType: number;
    // 棋手类型1/2
    placingPiecesType: number;
    // 判断是否开启ai true为开启
    startAI: boolean;
}

/**
 * @description 五子棋游戏主入口
 */
class Home extends React.Component<{}, IHome> {
    // 存储ai落子定时器
    useTimeout: any = null;

    constructor (props: {}) {
        super(props);
        this.state = {
            chessboard: [],
            layout: {
                chessboardX: FIRST_MODE,
                chessboardY: FIRST_MODE,
                gameMode: FIRST_MODE,
            },
            gameState: true,
            gameType: SECOND_TYPE,
            placingPiecesType: LOCINPIECES_X,
            startAI: false,
        };
    }

    /**
     * 根据传入value(棋格下标)先判断游戏是否结束/棋格是否已经落子，
     * 再设置落子人并添加历史记录，最后进行胜利判断
     * @param value 点击棋子的id/下标
     */
    onLatticeClick = (value: number) => {
        const {
            chessboard,
            gameState,
            placingPiecesType,
            startAI,
        } = this.state;
        if (chessboard[value].value !== LOCINPIECES_INIT || !gameState) return;
        const useLatticeList = chessboard.slice();
        const myHitory = store.getState().homeReducer.gameHitory;
        // 设置落子人
        useLatticeList[value] = {
            ...useLatticeList[value],
            value: placingPiecesType,
            id: chessboard[value].id,
        };
        // 设置历史记录
        const gameHitory = [...myHitory, {
            latticeHitory: useLatticeList[value],
            startAI,
        }];
        // 设置历史记录
        store.dispatch(setGameHitory(gameHitory));

        const nextPlType = placingPiecesType === LOCINPIECES_X
            ? LOCINPIECES_O : LOCINPIECES_X;
        // 修改下一步落子人
        this.setState({
            chessboard: useLatticeList,
            placingPiecesType: nextPlType,
            startAI: !startAI,
        }, () => {
            this.fallingChess(this.state);
        });
    };
    /**
     * 回退历史记录--传入index需要回退到哪步的下标
     * 循环棋盘和历史记录列表，查询相同id的棋格，还原该棋格落子状态
     * 判断回退的步骤是否使用ai
     * @param value 需要重置到哪步的落子状态
     * @param index 需要重置到哪步的下标
     */
    setHitory = (value: ILattice, index: number) => {
        const myHitory = store.getState().homeReducer.gameHitory;
        const useHitory = myHitory.slice(index);
        const { chessboard } = this.state;
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI < chessboard.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (chessboard[latticeI].id === useHitory[hitoryI].latticeHitory.id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI].latticeHitory,
                        value: LOCINPIECES_INIT,
                        id: chessboard[latticeI].id,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(chessboard[latticeI]);
        }
        store.dispatch(setGameHitory(myHitory.slice(0, index)));

        // 回退历史记录
        this.setState({
            chessboard: useLatticeList,
            placingPiecesType: value.value,
            gameState: true,
            startAI: myHitory[index].startAI,
        }, () => {
            if (myHitory[index].startAI) {
                if (index === 0) {
                    this.onAIStart(0);
                } else {
                    this.onAIStart();
                }
            }
        });
    };

    /**
     * 切换游戏类型，去除ai落子过程，更改游戏类型，调用initOrSwitch重新生成棋盘大小
     */
    onSetGameType = () => {
        if (this.useTimeout !== null) {
            clearTimeout(this.useTimeout);
        }
        const {
            gameType,
            layout,
        } = this.state;
        const useGameLayout = gameType === FIRST_TYPE ? FIRST_LOYOUT : SECOND_LOYOUT;
        const useGameMode = gameType === FIRST_TYPE ? SECOND_TYPE : FIRST_TYPE;
        const gameMode = layout.gameMode === SECOND_MODE ? FIRST_MODE : SECOND_MODE;
        this.setState({
            layout: {
                chessboardX: useGameLayout,
                chessboardY: useGameLayout,
                gameMode,
            },
            startAI: false,
            gameType: useGameMode,
        }, () => {
            this.initOrSwitch();
        });
    };

    /**
     * 初始化或者切换游戏时，用于初始化数据
     */
    initOrSwitch = () => {
        this.setState({
            gameState: true,
            placingPiecesType: LOCINPIECES_X,
            chessboard: initChessboard(this.state.layout || this.state.layout),
        });
        store.dispatch(setGameHitory([]));
    };

    /**
     * 落子后判断游戏胜负--获取最新的state根据determineLattice返回值判断是否有人胜出
     * 无人胜出则判断下一步是否需要ai查询
     */
    fallingChess = (state:IHome) => {
        const { chessboard, layout, startAI } = state;
        const { gameHitory } = store.getState().homeReducer;
        const placingPieces = gameHitory[gameHitory.length - 1];
        if (placingPieces && placingPieces.latticeHitory.id !== GAME_INIT) {
            // 判断是否有人胜出
            const gameState = determineLattice({
                latticeList: chessboard,
                placingPieces: chessboard[placingPieces.latticeHitory.id],
            }, layout);
            if (gameState.gameState) {
                this.setState({ gameState: false });
                return;
            }
            const draw = gameHitory.length !== layout.chessboardX * layout.chessboardY;
            if (startAI && draw) this.onAIStart();
        }
    };
    /**
     * AI落子--ai先手占边，后手使用aiSelect查找最优落子点，并在延迟后落子
     * @param value ai先手的点
     */
    onAIStart = (value?:number) => {
        let placingPieces = -1;
        const { chessboard, layout, placingPiecesType } = this.state;
        const { gameHitory } = store.getState().homeReducer;
        if (typeof value !== 'undefined' && chessboard[value].value === 0) {
            placingPieces = value;
        } else  {
            const useLattice = aiSelect(layout.gameMode, chessboard, placingPiecesType);
            placingPieces = useLattice.currentPlId;
        }
        const draw = gameHitory.length !== layout.chessboardX * layout.chessboardY;
        if (draw) {
            this.setState({ startAI: true }, () => {
                this.useTimeout = setTimeout(() => {
                    this.onLatticeClick(placingPieces);
                }, 1000);
            });
        }
    };
    /**
     * 点击落子--根据是否使用ai限制用户点击操作
     * @param value 落子的点位
     */
    onPlClick = (value: number) => {
        if (!this.state.startAI) {
            this.onLatticeClick(value);
        }
    };

    // 初始化
    componentDidMount () {
        this.initOrSwitch();
    }

    render () {
        const myHitory = store.getState().homeReducer.gameHitory;
        const {
            placingPiecesType,
            gameType,
            gameState,
            chessboard,
            layout,
        } = this.state;
        return (
            <div className={'Home'}>
                <header>
                    <GameTitle placingPieces={placingPiecesType} gameType={gameType}
                        gameState={gameState} layout={layout}/>
                </header>
                <aside>
                    <GameType onSetGameType={this.onSetGameType}/>
                    <GameAIStart onAIStart={this.onAIStart}/>
                </aside>
                <main>
                    <ul className={'gameList'}
                        style={{ gridTemplateColumns: setGameLayout(this.state.layout.chessboardX) }}>
                        {chessboard.map((value: ILattice) => {
                            return (
                                <GameLattice
                                    key={value.id}
                                    lattice={value}
                                    gameType={gameType}
                                    onLatticeClick={this.onPlClick}
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
                                    key={value.latticeHitory.id}
                                    useIndex={index}
                                    gameHitory={value.latticeHitory}
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
