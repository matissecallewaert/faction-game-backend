import { Config } from "../../Config";
import { faker } from "@faker-js/faker";
import {
  PrismaClient,
  RESOURCETYPE,
  UNITTYPE,
} from "../../prisma";
import { FastifyBaseLogger } from "fastify";

export class GameLogic {
  private prisma: PrismaClient;
  private log: FastifyBaseLogger;
  private currentGame: string = "";

  constructor(prisma: PrismaClient, log: FastifyBaseLogger) {
    this.prisma = prisma;
    this.log = log;
    this.startGame();
  }

  async startGame() {
    try {
      const game = await this.prisma.game.create({
        data: {
          name: faker.person.lastName(),
          width: Config.getWidth(),
          height: Config.getHeight(),
          amountOfMoves: 0,
        },
      });
      if (!game) {
        throw new Error("Game could not be created...");
      }
  
      this.currentGame = game.id;
      const baseLocations = this.shuffleArray(
        this.generateBaseIndices(Config.getWidth(), Config.getHeight(), 8, 10)
      );
      const resourceLocations = this.generateResourceIndices(
        Config.getWidth(),
        Config.getHeight(),
        10
      );
  
      const factions = [];
      for (let i = 0; i < 10; i++) {
        factions.push(
          this.prisma.faction.create({
            data: {
              id: i,
              gameId: game.id,
              gameName: game.name,
              baseIndex: baseLocations[i],
            },
          })
        );
      }
  
      const units = [];
      let factionId = 0;
      for (let i = 0; i < 20; i++) {
        let index = baseLocations[factionId] - 1;
        if (i % 2 === 1) index = baseLocations[factionId] - 1 + Config.getWidth();
  
        units.push(
          this.prisma.unit.create({
            data: {
              gameId: game.id,
              factionId: factionId,
              type: UNITTYPE.UNIT,
              health: 100,
              index: index,
            },
          })
        );
  
        if (i % 2 === 1) factionId++;
      }
  
      const tiles: {
        id: number;
        gameId: string;
        gameName: string;
        factionId: number;
        resourceType: RESOURCETYPE;
      }[] = [];
      for (let i = 0; i < Config.getWidth() * Config.getHeight(); i++) {
        tiles.push({
          id: i,
          gameId: game.id,
          gameName: game.name,
          factionId: -1,
          resourceType: resourceLocations.includes(i)
            ? RESOURCETYPE.RESOURCE
            : RESOURCETYPE.EMPTY,
        });
      }
  
      baseLocations.forEach((index, i) => {
        tiles[index].resourceType = RESOURCETYPE.BASE;
        tiles[index].factionId = i;
        tiles[index - 1].factionId = i;
        tiles[index - 1 + Config.getWidth()].factionId = i;
      });
  
      const tilePromises = tiles.map((tile) => {
        return this.prisma.tile.create({ data: tile });
      });
  
      try{
        await this.prisma.$transaction([...factions, ...units, ...tilePromises]);
      }catch(e){
        this.log.error(e);
  
        await this.prisma.game.delete({
          where: {
            id: game.id,
          },
        });
      }

      try{
        await this.prisma.currentGame.update({
          where: {
            id: 1,
          },
          data: {
            gameId: game.id,
            gameName: game.name,
          },
        });
      }catch(e){
        this.log.error(`Could not update current game to id: ${game.id} and name: ${game.name}...`);
      }

    }catch(e){
      this.log.error(e);
    }
  }

  endGame() {
    console.log("Game over!");
    this.startGame();
  }

  private generateBaseIndices(
    width: number,
    height: number,
    spacing: number,
    numIndices: number
  ): number[] {
    const indices: number[] = [];
    const minX = spacing;
    const maxX = width - spacing - 1;
    const minY = spacing;
    const maxY = height - spacing - 1;

    while (indices.length < numIndices) {
      const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
      const index = y * width + x;

      if (!indices.includes(index)) {
        indices.push(index);
      }
    }

    return indices;
  }

  private generateResourceIndices(
    width: number,
    height: number,
    numIndices: number
  ): number[] {
    const indices: number[] = [];

    while (indices.length < numIndices) {
      const index = Math.floor(Math.random() * (width * height));

      if (!indices.includes(index)) {
        indices.push(index);
      }
    }

    return indices;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
