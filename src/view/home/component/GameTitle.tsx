import React from 'react';
import { gameType } from '../../../tool/gameTools';
interface InGameTitle{
    gameType:number;
    gameStart:number;
    placingPieces:number;
}
/**
 * 游戏进程提示 */
const GameTitle = (props:InGameTitle) => {
    const latticeType =  gameType();
    /**
     * 设置游戏进程提示 */
    const setTitle = () => {
        let titleStr;
        const titleType = latticeType[props.gameType];
        if (props.gameStart === -1) {
            titleStr = '游戏结束---平局';
        } else if (props.gameStart === 0) {
            titleStr = (<>现在下棋的是---<span className={'gameTitle'}>{props.placingPieces === 1 ? titleType[0] : titleType[1]}</span></>);
        } else {
            titleStr =  (<>游戏结束---胜利者:  <span className={'gameEnd'}>{props.placingPieces === 1 ? titleType[1] : titleType[0]}</span></>);
        }
        return titleStr;
    };
    return (
        <div>
            {setTitle()}
        </div>
    );
};
export default GameTitle;
