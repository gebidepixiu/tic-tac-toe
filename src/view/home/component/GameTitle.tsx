import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { EPlacingPieces, IChessboard } from '../interface/home';
import store from '../../../store/store';
interface IGameTitle{
    // 游戏类型
    gameType:number;
    // 游戏状态
    gameState:boolean;
    // 落子人
    placingPieces:number;
    // 落子人
    layout:IChessboard;
}
/**
 * @description 游戏进程提示
 */
class GameTitle extends React.Component<IGameTitle> {
    constructor (props:IGameTitle) {
        super(props);
    }
    latticeType = gameType();
    /**
     * @description 设置游戏进程提示
     */
    setTitle = () => {
        let titleStr;
        const { gameHitory } = store.getState().homeReducer;
        const { placingPieces, gameState, layout } = this.props;
        const titleType = this.latticeType[this.props.gameType];
        if (gameState) {
            if (gameHitory.length === (layout.chessboardX * layout.chessboardY)) {
                titleStr = '游戏结束---平局';
            } else {
                titleStr = (<>现在下棋的是---<span className={'gameTitle'}>{placingPieces === EPlacingPieces.LOCINPIECES_X ? titleType[0] : titleType[1]}</span></>);
            }
        } else {
            titleStr = (<>游戏结束---胜利者: <span className={'gameEnd'}>{placingPieces === EPlacingPieces.LOCINPIECES_X ? titleType[1] : titleType[0]}</span></>);
        }
        return titleStr;
    };
    render ()  {
        return (
            <div>
                {this.setTitle()}
            </div>
        );
    }
}
export default GameTitle;
