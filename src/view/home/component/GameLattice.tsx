import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { InLattice } from '../interface/home';
interface InGameLattice{
    gameLayout:string;
    latticeList:InLattice[];
    gameType:number;
    onLatticeClick:Function;
}
/**
 * 渲染棋盘 */
const GameLattice = (props:InGameLattice) => {
    const latticeTYpe =  gameType();
    /**
     * 设置棋子类型 */
    const setLattice = (value:number) => {
        if (value === 0) return '';
        return latticeTYpe[props.gameType][value - 1];
    };
    /**
     * 设置棋子，判断胜负 */
    const onLatticeClick = (value:InLattice) => {
        props.onLatticeClick(value.id);
    };
    /**
     * 设置棋子样式 */
    const setClass = (value:InLattice) => {
        if (props.gameType === 0 && value.value !== 0) {
            return latticeTYpe[props.gameType][value.value - 1] === '黑' ? 'blackLattice' : 'whiteLattice';
        }
        return '';
    };
    return (
        <ul className={'gameList'} style={{ gridTemplateColumns: props.gameLayout }}>
            {props.latticeList.map((value:InLattice, index:number) => {
                return (
                    <li className={setClass(value)} key={index} onClick={() => onLatticeClick(value)}>
                        <span>
                            {setLattice(value.value)}
                        </span>
                    </li>
                );
            })}
        </ul>

    );
};
// @ts-ignore
export default GameLattice;
