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


interface IHome {
    chessboard:{placingPieces:ILattice, latticeList:ILattice[]};
    layout:IChessboard;
    gameStart:number;
    gameType:number;
    placingPieces:number;
}
/**
 * 五子棋游戏
 * */
class Home extends React.Component<{}, IHome> {
    chessboardInit:ILattice = {
        id: GAME_INIT,
        value: GAME_INIT,
        lattice: {
            latticeX: GAME_INIT,
            latticeY: GAME_INIT,
        },
    };
    constructor (props:{}) {
        super(props);
        this.state = {
            chessboard: {
                placingPieces: this.chessboardInit,
                latticeList: [],
            },
            layout: { chessboardX: ELayout.SECOND_LOYOUT, chessboardY: ELayout.SECOND_LOYOUT, gameMode: EGameMode.SECOND_MODE },
            gameStart: EGameStart.GAME_START,
            gameType: EGameType.FIRST_TYPE,
            placingPieces: EPlacingPieces.LOCINPIECES_X,
        };
    }
    // 判断游戏平局
    /** 设置历史记录，改变棋子样式 */
    onLatticeClick = (value:number) => {
        if (this.state.chessboard.latticeList[value].value !== EPlacingPieces.LOCINPIECES_INIT ||
            this.state.gameStart !== EGameStart.GAME_START) return;
        const useLatticeList = new Array(this.state.chessboard.latticeList.length);
        const myHitory = store.getState().homeReducer.gameHitory;
        // 储存入历史记录
        this.state.chessboard.latticeList.forEach((value, index:number) => {
            useLatticeList[index] = {
                id: value.id,
                lattice: value.lattice,
                value: value.value,
            };
        });
        const useChessboard = {
            placingPieces: this.chessboardInit,
            latticeList: useLatticeList,
        };
        // 设置落子人
        useChessboard.latticeList[value].value = this.state.placingPieces;
        useChessboard.placingPieces = useChessboard.latticeList[value];
        // 设置历史记录
        store.dispatch(setGameHitory([...myHitory, useChessboard.latticeList[value]]));
        // 修改下一步落子人
        this.setState({
            placingPieces: this.state.placingPieces === EPlacingPieces.LOCINPIECES_X
                ? EPlacingPieces.LOCINPIECES_O : EPlacingPieces.LOCINPIECES_X,
        });
        // 修改棋盘
        this.setState({ chessboard: useChessboard });
    };
    /**
     * 重置历史记录/回退游戏进程 */
    setHitory = (value:ILattice, index:number) => {
        const myHitory = store.getState().homeReducer.gameHitory;
        const useHitory = myHitory.slice(index);
        const useLatticeList = [];
        forLatticeList:for (let latticeI = 0; latticeI <  this.state.chessboard.latticeList.length; latticeI++) {
            for (let hitoryI = 0; hitoryI < useHitory.length; hitoryI++) {
                if (useHitory[hitoryI].id ===  this.state.chessboard.latticeList[latticeI].id) {
                    useLatticeList.push({
                        ...useHitory[hitoryI],
                        value: EPlacingPieces.LOCINPIECES_INIT,
                    });
                    continue forLatticeList;
                }
            }
            useLatticeList.push(this.state.chessboard.latticeList[latticeI]);
        }
        this.setState({
            chessboard: {
                placingPieces: index === 0 ? this.chessboardInit : myHitory[index - 1],
                latticeList: useLatticeList,
            },
        });
        this.setState({ placingPieces: value.value });
        store.dispatch(setGameHitory(myHitory.slice(0, index)));
        this.setState({ gameStart: EGameStart.GAME_START });
    };

    /**
     * 切换游戏类型 */
    onSetGameType = () => {
        const useGameLayout = this.state.gameType === EGameType.FIRST_TYPE ? ELayout.FIRST_LOYOUT : ELayout.SECOND_LOYOUT;
        const useGameMode = this.state.gameType === EGameType.FIRST_TYPE ? EGameType.SECOND_TYPE : EGameType.FIRST_TYPE;
        const gameMode = this.state.layout.gameMode === EGameMode.SECOND_MODE ? EGameMode.FIRST_MODE : EGameMode.SECOND_MODE;
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
        this.setState({
            chessboard: {
                ...this.state.chessboard,
                latticeList: initChessboard(layout || this.state.layout),
            },
        });
        this.setState({ placingPieces: EPlacingPieces.LOCINPIECES_X });
        this.setState({ gameStart: EGameStart.GAME_START });
        store.dispatch(setGameHitory([]));
    };

    // 判断胜负
    fallingChess = (newState:IHome) => {
        const { chessboard, layout } = newState;
        const { gameHitory } = store.getState().homeReducer;
        if (chessboard.placingPieces.id !== GAME_INIT) {
            let winner;
            // 判断是否有人胜出
            const gameStart = determineLattice(chessboard, layout.gameMode);
            if (gameStart) {
                winner = chessboard.placingPieces.value;
            } else {
                winner = EGameStart.GAME_DRAW;
                // 判断游戏是否平局
                if (gameHitory.length !== chessboard.latticeList.length) {
                    winner = EGameStart.GAME_START;
                }
            }
            if (winner !== EGameStart.GAME_START) this.setState({ gameStart: winner });
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
        if (nextStates.chessboard.placingPieces.id !== this.state.chessboard.placingPieces.id) {
            this.fallingChess(nextStates);
        } return true;
    }
    render () {
        const myHitory = store.getState().homeReducer.gameHitory;
        return (
            <div className={'Home'}>
                <header>
                    <GameTitle placingPieces={this.state.placingPieces} gameType={this.state.gameType} gameStart={this.state.gameStart}/>
                </header>
                <aside>
                    <GameType onSetGameType={this.onSetGameType}/>
                </aside>
                <main>
                    <ul className={'gameList'} style={{ gridTemplateColumns: setGameLayout(this.state.layout.chessboardX) }}>
                        {this.state.chessboard.latticeList.map((value:ILattice, index:number) => {
                            return (
                                <GameLattice
                                    key={index}
                                    lattice={value}
                                    gameType={this.state.gameType}
                                    onLatticeClick={this.onLatticeClick}
                                />
                            );
                        })}
                    </ul>
                    {/* <GameLattice */}
                    {/*    gameLayout={setGameLayout(this.state.layout.chessboardX)} */}
                    {/*    latticeList={this.state.chessboard.latticeList} */}
                    {/*    gameType={this.state.gameType} */}
                    {/*    onLatticeClick={this.onLatticeClick} */}
                    {/* /> */}
                </main>
                <footer className={'gameHitory'}>
                    {
                        myHitory.map((value, index: number) => {
                            return (
                                <GameHitory
                                    key={index}
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
