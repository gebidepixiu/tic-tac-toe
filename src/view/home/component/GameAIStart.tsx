import React from 'react';
/**
 * @description 点击进行AI落子
 */
class GameAIStart extends React.Component<{onAIStart:Function}> {
    constructor (props:{onAIStart:Function}) {
        super(props);
    }
    /**
     * @description AI落子优先落角
     */
    onAIStart = () => {
        this.props.onAIStart(0);
    };
    render () {
        return (
            <>
                <button onClick={this.onAIStart}>
                    AI落子
                </button>
            </>
        );
    }
}
export default GameAIStart;
