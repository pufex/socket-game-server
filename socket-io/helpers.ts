import type { GameType } from "../db/games/model"

export const lookForSettling = (board: GameType["board"]) => {

    const rowA = [
        board[0][0],
        board[1][0],
        board[2][0],
    ].join("")

    if(rowA === "XXX")
        return "X"
    else if(rowA === "OOO")
        return "O"

    const rowB = [
        board[0][1],
        board[1][1],
        board[2][1],
    ].join("")

    if(rowB === "XXX")
        return "X"
    else if(rowB === "OOO")
        return "O"

    const rowC = [
        board[0][2],
        board[1][2],
        board[2][2],
    ].join("")

    if(rowC === "XXX")
        return "X"
    else if(rowC === "OOO")
        return "O"

    const rowD = [
        board[0][0],
        board[0][1],
        board[0][2],
    ].join("")

    if(rowD === "XXX")
        return "X"
    else if(rowD === "OOO")
        return "O"

    const rowE = [
        board[1][0],
        board[1][1],
        board[1][2],
    ].join("")

    if(rowE === "XXX")
        return "X"
    else if(rowE === "OOO")
        return "O"

    const rowF = [
        board[2][0],
        board[2][1],
        board[2][2],
    ].join("")

    if(rowF === "XXX")
        return "X"
    else if(rowF === "OOO")
        return "O"

    const rowG = [
        board[0][0],
        board[1][1],
        board[2][2],
    ].join("")

    if(rowG === "XXX")
        return "X"
    else if(rowG === "OOO")
        return "O"

    const rowH = [
        board[0][2],
        board[1][1],
        board[2][0],
    ].join("")

    if(rowH === "XXX")
        return "X"
    else if(rowH === "OOO")
        return "O"

    let count = 0;
    for(let i = 0; i < 3; i++)
        for(let j = 0; j < 3; j++)
            if(board[i][j] !== null)
                count++;
    if(count >= 9)
        return undefined
    return null
}

