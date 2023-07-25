import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { EGameStart, EPlacingPieces } from '../constant/home';
interface IGameTitle{
    gameType:number; // 游戏类型
    gameStart:number;// 游戏状态
    placingPieces:number;// 落子人
}
/**
 * 游戏进程提示 */
class GameTitle extends React.Component<IGameTitle> {
    constructor (props:IGameTitle) {
        super(props);
    }
    latticeType =  gameType();
    /**
     * 设置游戏进程提示 */
    setTitle = () => {
        let titleStr;
        const titleType = this.latticeType[this.props.gameType];
        if (this.props.gameStart === EGameStart.GAME_DRAW) {
            titleStr = '游戏结束---平局';
        } else if (this.props.gameStart === EGameStart.GAME_START) {
            titleStr = (<>现在下棋的是---<span className={'gameTitle'}>{this.props.placingPieces === EPlacingPieces.LOCINPIECES_X ? titleType[0] : titleType[1]}</span></>);
        } else {
            titleStr =  (<>游戏结束---胜利者:  <span className={'gameEnd'}>{this.props.placingPieces === EPlacingPieces.LOCINPIECES_X ? titleType[1] : titleType[0]}</span></>);
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
