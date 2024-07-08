import mongoose from "mongoose"
import { defaultBoard } from "./constants"
import { selectPlayerRandomly } from "./helpers"

export type Player = "X" | "O"
export type RPSFieldType = Player | null
export type GameType = {
    name: string,
    board: [
        [RPSFieldType,RPSFieldType,RPSFieldType],
        [RPSFieldType,RPSFieldType,RPSFieldType],
        [RPSFieldType,RPSFieldType,RPSFieldType]
    ],
    turn: 0,
    currentTurn: Player
    X: null | string,
    O: null | string,
    isActive: boolean,
    isFinished: boolean,
    isDraw: boolean,
    winner: null | string,
}

export type GameFromForm = {
    name: string,
}

export type GameInResponseType = GameType & {id: string}


const GameSchema = new mongoose.Schema<GameType>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    board: {
        type: [[String]],
        default: defaultBoard
    },
    turn: {
        type: Number,
        default: 0,
    },
    currentTurn: {
        type: String,
        default: selectPlayerRandomly
    },
    X: {
        type: String,
        default: null
    },
    O: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isFinished: {
        type: Boolean,
        default: false
    },
    isDraw: {
        type: Boolean,
        default: false
    },
    winner: {
        type: String,
        default: null
    },
})

const GameModel = mongoose.model("Game", GameSchema)

export default GameModel