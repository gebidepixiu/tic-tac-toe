import React from 'react';
/***/
class GameType extends React.Component<{onSetGameType:Function}> {
    constructor (props:{onSetGameType:Function}) {
        super(props);
    }
    onSetGameType = () => {
        this.props.onSetGameType();
    };
    render () {
        return (
            <>
                <button onClick={this.onSetGameType}>
                    切换游戏类型
                </button>
            </>
        );
    }

    /** 切换游戏类型 */
}
export default GameType;
