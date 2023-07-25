import React from 'react';
import { ILattice } from '../interface/home';
interface IGameHitoryParams {
    setHitory: Function;// 设置历史记录
    gameHitory: ILattice;// 历史记录
    useIndex: number;// 棋子下标
}

/***/
class GameHitory extends React.Component<IGameHitoryParams> {
    constructor (props:IGameHitoryParams) {
        super(props);
    }

    /**
     * 设置历史记录 */
    onSetHitory = () => {
        this.props.setHitory(this.props.gameHitory, this.props.useIndex);
    };
    render () {
        return (
            <button onClick={this.onSetHitory}>
                悔棋到第{this.props.useIndex + 1}步
            </button>
        );
    }
}
export default GameHitory;
