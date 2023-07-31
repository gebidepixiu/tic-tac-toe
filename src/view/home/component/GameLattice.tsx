import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { ILattice, EPlacingPieces, EGameType  } from '../interface/home';

interface IGameLattice{
    // 当前棋子列表
    lattice:ILattice;
    // 游戏类型
    gameType:number;
    // 落子
    onLatticeClick:Function;
}
/**
 * @description 棋盘
 */
class GameLattice extends React.Component<IGameLattice> {
    constructor (props:IGameLattice) {
        super(props);
    }
    latticeTYpe = gameType();
    /**
     * @description 设置棋子类型
     * @param value 棋子类型0/1
     */
    setLattice = (value:number) => {
        if (value === EPlacingPieces.LOCINPIECES_INIT) return '';
        return this.latticeTYpe[this.props.gameType][value - 1];
    };
    /**
     * @description 设置棋子，判断胜负
     */
    onLatticeClick = () => {
        this.props.onLatticeClick(this.props.lattice.id);
    };
    /**
     * @description 设置棋子样式
     * @param value 棋子数据
     */
    setClass = (value:ILattice) => {
        if (this.props.gameType === EGameType.FIRST_TYPE && value.value !== EPlacingPieces.LOCINPIECES_INIT) {
            return this.latticeTYpe[this.props.gameType][value.value - 1] === '黑' ? 'blackLattice' : 'whiteLattice';
        }
        return '';
    };
    // 优化渲染次数
    shouldComponentUpdate (nextProps: IGameLattice) {
        return this.props.lattice.value !== nextProps.lattice.value;
    }
    render () {
        return (
            <li className={this.setClass(this.props.lattice)} onClick={this.onLatticeClick}>
                <span>
                    {this.setLattice(this.props.lattice.value)}
                </span>
            </li>
        );
    }
}
export default GameLattice;
