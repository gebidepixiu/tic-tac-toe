import React from 'react';
import { gameType } from '../../../tool/gameTools';
interface InGameLattice{
    latticeId:number;
    latticeValue:number;
    gameType:number;
    onLatticeClick:Function;
}

/**
 * 渲染棋盘 */
const GameLattice = (props:InGameLattice) => {
    const latticeTYpe =  gameType();
    /**
     * 设置棋子类型 */
    const setLattice = () => {
        if (props.latticeValue === 0) return '';
        return latticeTYpe[props.gameType][props.latticeValue - 1];
    };
    /**
     * 设置棋子，判断胜负 */
    const onLatticeClick = () => {
        props.onLatticeClick(props.latticeId);
    };
    /**
     * 设置棋子样式 */
    const setClass = () => {
        if (props.gameType === 0 && props.latticeValue !== 0) {
            return latticeTYpe[props.gameType][props.latticeValue - 1] === '黑' ? 'blackLattice' : 'whiteLattice';
        }
        return '';
    };
    return (
        <li className={setClass()} onClick={onLatticeClick}>
            <span>
                {setLattice()}
            </span>
        </li>
    );
};
export default React.memo(GameLattice);
