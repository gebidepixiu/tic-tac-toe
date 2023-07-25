import React from 'react';
import { gameType } from '../../../tool/gameTools';
import { ILattice } from '../interface/home';
import { EPlacingPieces, EGameType } from '../constant/home';

interface IGameLattice{
    lattice:ILattice;// 当前棋子列表
    gameType:number;// 游戏类型
    onLatticeClick:Function;// 落子
}
/**
 * 渲染棋盘 */
class GameLattice extends React.Component<IGameLattice> {
    constructor (props:IGameLattice) {
        super(props);
    }
    latticeTYpe =  gameType();
    /**
     * 设置棋子类型 */
    setLattice = (value:number) => {
        if (value === EPlacingPieces.LOCINPIECES_INIT) return '';
        return this.latticeTYpe[this.props.gameType][value - 1];
    };
    /**
     * 设置棋子，判断胜负 */
    onLatticeClick = () => {
        this.props.onLatticeClick(this.props.lattice.id);
    };
    /**
     * 设置棋子样式 */
    setClass = (value:ILattice) => {
        if (this.props.gameType === EGameType.FIRST_TYPE && value.value !== EPlacingPieces.LOCINPIECES_INIT) {
            return this.latticeTYpe[this.props.gameType][value.value - 1] === '黑' ? 'blackLattice' : 'whiteLattice';
        }
        return '';
    };
    render () {
        return (
            <li className={this.setClass(this.props.lattice)} onClick={this.onLatticeClick}>
                <span>
                    {this.setLattice(this.props.lattice.value)}
                </span>
            </li>
            // <ul className={'gameList'} style={{ gridTemplateColumns: this.props.gameLayout }}>
            //     {this.props.latticeList.map((value:ILattice, index:number) => {
            //         return (
            //             <li className={this.setClass(value)} key={index} onClick={() => this.onLatticeClick(value)}>
            //                 <span>
            //                     {this.setLattice(value.value)}
            //                 </span>
            //             </li>
            //         );
            //     })}
            // </ul>

        );
    }
}
// @ts-ignore
export default GameLattice;
