import type { Player } from "../db/games/model"
import type { DefaultEventsMap as DEM } from "socket.io/dist/typed-events"
import type { Server, Socket } from "socket.io"
import type { ExtendedError } from "socket.io/dist/namespace"

export type EnterGamePayload = {
    game: string,
}

export type AskToLeaveGamePayload = EnterGamePayload

export type AskForListPayload = {
    game: string,
}

export type AskToStartGamePayload = AskForListPayload

export type AskForSlotPayload = {
    game: string,
    player: Player,
}

export type AskToExitSlotPayload = {
    game: string,
    player: Player,
}

export type UsurpationPayload = {
    game: string,
    row: number,
    col: number,
}

export type AskToSendMessagePayload = {
    message: string,
    game: string
}

export type MessageType = {
    isAdmin: boolean,
    name?: string,
    message: string,
    timestamp: Date
}

export type IoType = Server<DEM,DEM,DEM,any>
export type SocketType = Socket<DEM,DEM,DEM,any>
export type IONextFunction = (err?: ExtendedError) => void