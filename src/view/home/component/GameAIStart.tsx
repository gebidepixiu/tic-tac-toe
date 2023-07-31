import React from 'react';
/**
 * @description AI开始游戏
 */
class GameAIStart extends React.Component<{onAIStart:Function}> {
    constructor (props:{onAIStart:Function}) {
        super(props);
    }
    /**
     * @description AI先下
     */
    onAIStart = () => {
        this.props.onAIStart();
    };
    render () {
        return (
            <>
                <button onClick={this.onAIStart}>
                    AI先手
                </button>
            </>
        );
    }
}
export default GameAIStart;
