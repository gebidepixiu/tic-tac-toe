import React from 'react';
import GameTitle from './component/GameTitle';
import GameHitory from './component/GameHitory';
import '../../assets/css/home.css';
import { determineLattice, initChessboard, setGameLayout } from '../../tool/gameTools';
import GameLattice from './component/GameLattice';
import GameType from './component/GameType';
import { IChessboard, ILattice } from './interface/home';
import {
    EGameStart, GAME_INIT, EGameType, EPlacingPieces, ELayout, EGameMode
} from './constant/home';
import store from '../../store/store';
import { setGameHitory } from '../../store/homeReducer';

const { FIRST_LOYOUT, SECOND_LOYOUT } = ELayout;// 游戏布局
const { FIRST_MODE, SECOND_MODE } = EGameMode;// 游戏
const { GAME_DRAW, GAME_START } = EGameStart;// 游戏状态
const { FIRST_TYPE, SECOND_TYPE } = EGameType;// 游戏类型
const { LOCINPIECES_INIT, LOCINPIECES_X, LOCINPIECES_O } = EPlacingPieces;// 棋手

interface IHome {
    chessboard:ILattice[];// 棋盘
    layout:IChessboard;// 布局
    gameStart:number;// 游戏状态
    gameType:number;// 游戏类型
    placingPiecesType:number;// 棋手
    placingPieces:number;// 当前落子人
}
/**
 * 五子棋游戏
 * */
class Home extends React.Component<{}, IHome> {
    constructor (props:{}) {
        super(props);
        this.state = {
            chessboard: [],
            layout: { chessboardX: SECOND_LOYOUT, chessboardY: SECOND_LOYOUT, gameMode: SECOND_MODE },
            gameStart: GAME_START,
            gameType: FIRST_TYPE,
            placingPieces: -1,
            placingPiecesType: LOCINPIECES_X,
        };
    }
    /** 设置历史记录，改变棋子样式 */
    onLatticeClick = (value:number) => {
        if (this.state.chessboard[value].value !== LOCINPIECES_INIT ||
            this.state.gameStart !== GAME_START) return;
        const useLatticeList = new Array(this.state.chessboard.length);
        const myHitory = store.getState().homeReducer.gameHitory;
        // 储存入历史记录
        this.state.chessboard.forEach((value, index:number) => {
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
            placingPiecesType: this.state.placingPiecesType === LOCINPIECES_X
                ? LOCINPIECES_O : LOCINPIECES_X,
        });
        this.setState({ placingPieces: useChessboard[value].id });
        // 修改棋盘
        this.setState({ chessboard: useChessboard });
    };
    /**
     * 重置历史记录/回退游戏进程 */
    setHitory = (value:ILattice, index:number) => {
        const myHitory = store.getState().homeReducer.gameHitory;
        const useHitory = myHitory.slice(index);
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI <  this.state.chessboard.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (useHitory[hitoryI].id ===  this.state.chessboard[latticeI].id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI],
                        value: LOCINPIECES_INIT,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(this.state.chessboard[latticeI]);
        }
        this.setState({ placingPieces: index === 0 ? -1 : myHitory[index - 1].id });
        this.setState({ chessboard: useLatticeList });
        this.setState({ placingPiecesType: value.value });
        store.dispatch(setGameHitory(myHitory.slice(0, index)));
        this.setState({ gameStart: GAME_START });
    };

    /**
     * 切换游戏类型 */
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

    // 初始化或者切换游戏
    initOrSwitch = (layout?:IChessboard) => {
        this.setState({ chessboard: initChessboard(layout || this.state.layout) });
        this.setState({ placingPieces: GAME_INIT });
        this.setState({ placingPiecesType: LOCINPIECES_X });
        this.setState({ gameStart: GAME_START });
        store.dispatch(setGameHitory([]));
    };

    // 判断胜负
    fallingChess = (newState:IHome) => {
        const { chessboard, layout, placingPieces } = newState;
        const { gameHitory } = store.getState().homeReducer;
        if (placingPieces !== GAME_INIT) {
            let winner;
            // 判断是否有人胜出
            const gameStart = determineLattice({ latticeList: chessboard, placingPieces: chessboard[placingPieces] }, layout.gameMode);
            if (gameStart) {
                winner = chessboard[placingPieces].value;
            } else {
                winner = GAME_DRAW;
                // 判断游戏是否平局
                if (gameHitory.length !== chessboard.length) {
                    winner = GAME_START;
                }
            }
            if (winner !== GAME_START) this.setState({ gameStart: winner });
        }
    };
    // 初始化
    componentDidMount () {
        this.initOrSwitch();
    }
    // 更新状态
    shouldComponentUpdate (nextProps:unknown, nextStates:IHome) {
        if (nextStates.layout.chessboardX !== this.state.layout.chessboardX) {
            this.initOrSwitch(nextStates.layout);
        }
        if (nextStates.placingPieces !== this.state.placingPieces) {
            this.fallingChess(nextStates);
        } return true;
    }
    render () {
        const myHitory = store.getState().homeReducer.gameHitory;
        return (
            <div className={'Home'}>
                <header>
                    <GameTitle placingPieces={this.state.placingPiecesType} gameType={this.state.gameType} gameStart={this.state.gameStart}/>
                </header>
                <aside>
                    <GameType onSetGameType={this.onSetGameType}/>
                </aside>
                <main>
                    <ul className={'gameList'} style={{ gridTemplateColumns: setGameLayout(this.state.layout.chessboardX) }}>
                        {this.state.chessboard.map((value:ILattice) => {
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
