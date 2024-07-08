import type { Request, Response } from "express";
import type { GameType, GameFromForm, GameInResponseType } from "./model";
import Game from "./model"

export const getAllGames = async (
    req: Request,
    res: Response
) => {
    const games = await Game.find()
        .lean().exec()
    const polishedGames: GameInResponseType[] = games.map(game => ({
        id: game._id.toString(),
        name: game.name,
        board: game.board,
        currentTurn: game.currentTurn,
        turn: game.turn,
        X: game.X,
        O: game.O,
        isActive: game.isActive,
        isDraw: game.isDraw,
        isFinished: game.isFinished,
        winner: game.winner,
    }))
    res.json(polishedGames)
}

export const getGameByName = async (
    req: Request,
    res: Response
) => {
    const game_name = req.params.id
    if(!game_name)
        return res.status(400).json({message: "Missing game name."})

    const gameQuery = {name: game_name}
    const game = await Game.findOne(gameQuery)
        .lean().exec()

    if(!game)
        return res.status(404).json({message: "Game not found"})

    const polishedGame: GameInResponseType = {
        id: game._id.toString(),
        name: game.name,
        board: game.board,
        currentTurn: game.currentTurn,
        turn: game.turn,
        X: game.X,
        O: game.O,
        isActive: game.isActive,
        isDraw: game.isDraw,
        isFinished: game.isFinished,
        winner: game.winner,
    }
    res.json(polishedGame)
}   

export const createGame = async (
    req: Request,
    res: Response
) => {
    const {name} = req.body as GameFromForm
    if(!name)
        return res.status(400).json({message: "Missing game name."})
    
    const existingGameQuery = {name}
    const existingGame = await Game.findOne(existingGameQuery)
        .lean().exec()
    if(existingGame)
        return res.status(409).json({message: "This game already exists."})

    await Game.create({name})
    res.status(201).json({message: `Room ${name} created!`})
}

export const deleteGameByName = async (
    req: Request,
    res: Response
) => {
    const game_name = req.params.id
    if(!game_name)
        return res.status(400).json({message: "Missing game name."})
    
    const gameQuery = {name: game_name}
    const game = await Game.findOne(gameQuery)
        .exec()
    
    if(!game)
        return res.sendStatus(204)

    await game.deleteOne()
    res.sendStatus(200)
}