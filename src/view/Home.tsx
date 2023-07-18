import React, {Dispatch, useEffect, useState} from "react";
import '../assets/css/home.css'
import {selectClick1} from "../tool/ChessGame";
import {vals} from "../interface/home";
/*
* 项目可以通过修改selectClick1函数的row属性，
* 更改连棋属性如：3则为3子祺，5则为5子祺
* 通过gameListFor2控制棋盘大小，默认3子棋为3*3，5子棋为5*5
* */
const Home = () => {
    // 主棋盘
    const [gameList, setGameList] = useState<{ val: vals, list: vals[] }>({val: {coordinate:{x:0,y:0}}, list: []})

    // 历史记录
    const [useHistory, setUseHistory] = useState<vals[][]>([])

    // 棋盘布局
    const [gameListFor2, setGameListFor2] = useState({x: 5, y: 5})

    // 棋手
    const [clickRow, setClickRow] = useState(1)

    // 状态
    const [gameStart, setGameStart] = useState<boolean>(false)

    // 初始化棋盘，设置棋盘点坐标
    const getListLength = () => {
        const myLength = gameListFor2.x * gameListFor2.y
        let yCoordinate = 0, xCoordinate = 0;
        const lists: vals[] = []
        for (let i = 0; i < myLength; i++) {
            if (i % gameListFor2.x == 0) {
                xCoordinate++
                yCoordinate = 0
            }
            yCoordinate++
            lists.push({id: i, coordinate: {x: xCoordinate, y: yCoordinate}, value: 0})
        }

        // 初始化棋盘
        setGameList({val: {coordinate:{x:0,y:0}}, list: lists})
    }

    // 判断点击显示
    const useView = (val?: number) => {
        if (val == 0) return ''
        return val == 1 ? 'X' : 'o'
    }

    // 根据游戏切换落子样式
    const useGameType = (val?: number) => {
        if (typeof val == 'undefined') return
        if (val == 0 || gameListFor2.x == 3 && gameListFor2.y == 3) return ''
        return val == 1 ? 'forBlack' : 'forWhite'
    }

    // 获取当前棋手
    const getGamePlayName = () => {
        let start, str
        if (gameListFor2.x == 3 && gameListFor2.y == 3) {
            start = clickRow == 1 ? 'X' : 'o'
        } else {
            start = clickRow == 1 ? '黑子' : '白子'
        }
        str = (<>现在下棋的是 <span>{start}</span></>)
        if (gameStart) {
            if (gameListFor2.x == 3 && gameListFor2.y == 3) {
                start = clickRow == 1 ? 'o' : 'X'
            } else {
                start = clickRow == 1 ? '白子' : '黑子'

            }
            str = (<>游戏结束！！赢家 <span>{start}</span></>)
        }
        return str
    }

    // 点击更新视图
    const useClick = (val: vals) => {
        if (val.value != 0 || gameStart) return
        const vals = {...val}
        const oldGameList = JSON.parse(JSON.stringify(gameList.list))
        const newGameList = []
        // 设置历史记录
        const newHistory: any[] = [...useHistory, gameList.list]
        setUseHistory(newHistory)
        // 更新视图
        for (let i = 0; i < oldGameList.length; i++) {
            if (oldGameList[i].id == val.id) {
                newGameList.push({
                    ...oldGameList[i],
                    value: clickRow
                })
            } else {
                newGameList.push(oldGameList[i])
            }

        }
        vals.value = clickRow
        setGameList({val: vals, list: newGameList})

        // 重置棋手
        setClickRow(() => {
            return clickRow == 1 ? 2 : 1
        })

    }

    // 切换游戏类型
    const switchGameType = () => {
        // 切换类型，重置棋盘
        const data = {
            x: 3,
            y: 3
        }
        if (gameListFor2.x * gameListFor2.y == 9) {
            data.x = 5
            data.y = 5
        }
        setUseHistory([])
        setGameStart(false)
        setGameListFor2(data)
    }

    // 判断落子
    useEffect(() => {
        if (gameList.val.value != undefined) {
            const row = gameListFor2.x==3&&gameListFor2.y==3?3:5
            selectClick1(gameList.list, gameListFor2, row, gameList.val, setGameStart)
        }

    }, [gameList])

    // 重置棋盘
    useEffect(() => {
        getListLength()
    }, [gameListFor2])
    return (
        <div className={'Home'}>
            <main className={'gameMain'}>
                <header>
                    <div className={'gameHead'}>
                        {getGamePlayName()}
                    </div>
                    <div>
                        <button onClick={switchGameType}>
                            切换游戏类型
                        </button>
                    </div>
                </header>
                <ul className={gameListFor2.x != 3 ? 'gameList' : 'gameList gameListFor2'}>
                    {
                        gameList.list.map((val, index) => {
                            return (
                                <li key={index} onClick={() => useClick(val)} className={useGameType(val.value)}>
                                    <span>
                                        {useView(val.value)}
                                    </span>
                                </li>
                            )
                        })
                    }
                </ul>
                <section>
                    <History
                        useView={gameList}
                        setView={setGameList}
                        useHistory={useHistory}
                        setGameStart={setGameStart}
                    />
                </section>
            </main>
        </div>
    )
}

interface historyProps {
    useView: { val: vals, list: vals[] },
    setView: Dispatch<{ val: vals, list: vals[] }>,
    useHistory: vals[][],
    setGameStart: Dispatch<boolean>
}

const History = ({useView, setView, useHistory, setGameStart}: historyProps) => {
    const controlHistory = (val: number) => {
        const newList = useHistory.slice(val, val + 1)[0]
        setView({val: useView.val, list: newList})
        setGameStart(false)
    }
    return (
        <>
            <ul className={'gameHistory'}>
                {
                    useHistory.map((val: vals[], index: number) => {
                        return (
                            <li key={index}>
                                <button onClick={() => controlHistory(index)}>悔棋到第 {index+1} 步</button>
                            </li>
                        )
                    })
                }

            </ul>
        </>
    )
}
export default Home