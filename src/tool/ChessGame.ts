// 获取总集合，每行数量，需要游玩的计数（三子棋/五子棋/）
import {Dispatch} from "react";
import {inCoordinate, vals} from "../interface/home";
/*
* 判断胜负的思路是根据落旗点获取该点的所有直角或斜角判断是否有row个相同棋子连在一起，有就为胜利，并且传入setGameStart更改状态*/
export const selectClick1 = (seleList: vals[], useLength: { x: number; y: number }, row: number, val: vals,setGameStart:Dispatch<boolean>) => {
    const {x, y} = useLength
    const bigXY = x > y ? x : y

    //向上/下查找
    const YValue = JSON.parse(JSON.stringify(val))
    const Xconnler = [], Yconnler = [], XYconnler = [], YXconnler = []
    // 竖线
    for (let i = 0; i < y; i++) {
        Xconnler.push({x: i + 1, y: YValue.coordinate.y})
    }

    lookEnd(seleList, Xconnler, row, val,setGameStart)


    // 横线
    for (let i = 0; i < x; i++) {
        Yconnler.push({x: YValue.coordinate.x, y: i + 1})
    }
    lookEnd(seleList, Yconnler, row, val,setGameStart)


    // 左斜线
    const big = YValue.coordinate.x > YValue.coordinate.y
    const bigInt = big ? YValue.coordinate.y : YValue.coordinate.x
    // 获取左边最处角度
    let getUp = {x: 0, y: 0}
    if (bigInt == 1) {
        XYconnler.push({x: YValue.coordinate.x, y: YValue.coordinate.y})
    }
    if (getUp.x == 0) {
        for (let i = 1; i <= bigInt - 1; i++) {
            if ((i == (bigInt - 1))) {
                getUp.x = big ? (YValue.coordinate.x - i) : 1
                getUp.y = big ? 1 : (YValue.coordinate.y - i)

            }
        }
    }
    for (let j = 1; j <= bigXY; j++) {
        if (getUp.x + j > (y + 1) || getUp.y + j > (x + 1)) break
        XYconnler.push({x: (getUp.x + j - 1), y: (getUp.y + j - 1)})
    }
    lookEnd(seleList, XYconnler, row, val,setGameStart)


    // 右斜线
    const masInt = big ? YValue.coordinate.x : YValue.coordinate.y
    // 获取左边最处角度
    getUp = {x: 0, y: 0}
    if (YValue.coordinate.y == x || YValue.coordinate.x == 1) {
        getUp = {x: YValue.coordinate.x, y: YValue.coordinate.y}
    }
    if (getUp.x == 0) {
        for (let i = 1; i <= masInt; i++) {
            if ((YValue.coordinate.y + i) == x || (YValue.coordinate.x - i) == 1) {
                getUp.x = YValue.coordinate.x - i
                getUp.y = YValue.coordinate.y + i
                break
            }
        }
    }

    for (let j = 0; j <= masInt; j++) {
        if ((getUp.x + j) == (y + 1) || (getUp.y - j) == 0) break
        YXconnler.push({x: (getUp.x + j), y: (getUp.y - j)})
    }
    lookEnd(seleList, YXconnler, row, val,setGameStart)
    return null
}


//判断当前四线是否存在超过游戏要求连接一起的线
const lookEnd = (seleList: vals[], xyZom: inCoordinate[], row: number, val: vals,setGameStart:Dispatch<boolean>) => {
    const setList = []
    for (let i = 0; i < seleList.length; i++) {
        for (let j = 0; j < xyZom.length; j++) {
            if (seleList[i].value != 0) {
                    if ((seleList[i].coordinate.x == xyZom[j].x && seleList[i].coordinate.y == xyZom[j].y) && seleList[i].value == val.value) {
                        setList.push(seleList[i])
                    
                }

            }
        }
    }
    if (setList.length < row) return false
    console.log('竖线/竖线成功：游戏结束')
    setGameStart(true)
    return true
}