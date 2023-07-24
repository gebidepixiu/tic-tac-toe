import React from 'react';
import { InLattice } from '../interface/home';
interface InGameHitoryParams {
    setHitory: Function;
    gameHitory: InLattice;
    useIndex: number;
}

/***/
const GameHitory = (props:InGameHitoryParams) => {
    /**
     * 设置历史记录 */
    const onSetHitory = () => {
        props.setHitory(props.gameHitory, props.useIndex);
    };
    return (
        <button onClick={onSetHitory}>
            悔棋到第{props.useIndex + 1}步
        </button>
    );
};
export default GameHitory;
