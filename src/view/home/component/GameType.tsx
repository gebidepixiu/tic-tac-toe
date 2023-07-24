import React from 'react';
/***/
const GameType = (props: { onSetGameType:Function }) => {
    /** 切换游戏类型 */
    const onSetGameType = () => {
        props.onSetGameType();
    };
    return (
        <>
            <button onClick={onSetGameType}>
                切换游戏类型
            </button>
        </>
    );
};
export default GameType;
