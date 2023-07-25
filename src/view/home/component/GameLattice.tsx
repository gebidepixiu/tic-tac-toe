import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { InLattice } from '../interface/home';
interface InGameLattice{
    lattice:InLattice;
    gameType:number;
    onLatticeClick:Function;
}
/**
 * 渲染棋盘 */
const GameLattice = (props:InGameLattice) => {
    console.log('render');
    const latticeTYpe =  gameType();
    /**
     * 设置棋子类型 */
    const setLattice = (value:number) => {
        if (value === 0) return '';
        return latticeTYpe[props.gameType][value - 1];
    };
    /**
     * 设置棋子，判断胜负 */
    const onLatticeClick = () => {
        props.onLatticeClick(props.lattice.id);
    };
    /**
     * 设置棋子样式 */
    const setClass = () => {
        if (props.gameType === 0 && props.lattice.value !== 0) {
            return latticeTYpe[props.gameType][props.lattice.value - 1] === '黑' ? 'blackLattice' : 'whiteLattice';
        }
        return '';
    };
    return (

        <li className={setClass()} onClick={() => onLatticeClick()}>
            <span>
                {setLattice(props.lattice.value)}
            </span>
        </li>


    );
};
export default React.memo(GameLattice, (prevProps:any, nextProps:any) => {
    if (nextProps.lattice.value !== 0 && prevProps.lattice.value === 0) {
        console.log(prevProps.lattice);
        console.log(nextProps.lattice);
        return false;
    }
    return true;
});
