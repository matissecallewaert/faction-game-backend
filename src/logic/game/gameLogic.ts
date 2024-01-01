import { Config } from "../../Config";
import { faker } from "@faker-js/faker";
import { PrismaClient, RESOURCETYPE, UNITTYPE, Unit } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { UNITMOVETYPE } from "../../constants/UnitMoveType";
import { GameContext } from "../../objects/GameContext";
import { unitCost, unitHealth, unitMoveCost } from "../../constants/constants";
import { BASEMOVETYPE } from "../../constants/BaseMoveType";
import ApiBaseMove from "../../api/ApiBaseMove";

export class GameLogic {
  private prisma: PrismaClient;
  private log: FastifyBaseLogger;
  private currentGame: string = "";
  private amountOfMoves: number = 0;

  constructor(prisma: PrismaClient, log: FastifyBaseLogger) {
    this.prisma = prisma;
    this.log = log;
    this.startGame();
  }

  async startGame() {
    this.log.info("Initializing game...");

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
        if (i % 2 === 1)
          index = baseLocations[factionId] - 1 + Config.getWidth();

        units.push({
          gameId: game.id,
          factionId: factionId,
          type: UNITTYPE.PIONEER,
          health: 100,
          index: index,
        });

        if (i % 2 === 1) factionId++;
      }

      try {
        await this.prisma.$transaction([...factions]);
      } catch (e) {
        this.log.error(e);

        await this.prisma.game.delete({
          where: {
            id: game.id,
          },
        });

        throw new Error("Game could not be initialized...");
      }

      let resultUnits: Unit[] = [];

      try {
        await Promise.all(
          units.map(async (unit) => {
            const resUnit = await this.prisma.unit.create({ data: unit });
            resultUnits.push(resUnit);
          })
        );
      } catch (e) {
        this.log.error(e);

        await this.prisma.game.delete({
          where: {
            id: game.id,
          },
        });

        throw new Error("Game could not be initialized...");
      }

      const tiles: {
        id: number;
        gameId: string;
        gameName: string;
        factionId: number;
        resourceType: RESOURCETYPE;
        unit?: string;
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

      resultUnits.forEach((unit) => {
        tiles[unit.index].unit = unit.id;
      });

      const tilePromises = tiles.map((tile) => {
        return this.prisma.tile.create({ data: tile });
      });

      try {
        await this.prisma.$transaction([...tilePromises]);
      } catch (e) {
        this.log.error(e);

        await this.prisma.game.delete({
          where: {
            id: game.id,
          },
        });

        throw new Error("Game could not be initialized...");
      }

      try {
        await this.prisma.currentGame.update({
          where: {
            id: 1,
          },
          data: {
            gameId: game.id,
            gameName: game.name,
          },
        });

        this.log.info("Game initialized!");
      } catch (e) {
        this.log.error(
          `Could not update current game to id: ${game.id} and name: ${game.name}...`
        );
        throw new Error("Game could not be initialized...");
      }
    } catch (e) {
      this.log.error(e);
      throw new Error("Game could not be initialized...");
    }
  }

  async BaseMoves() {
    const game = await this.prisma.game.findUnique({
      where: {
        id: this.currentGame,
      },
      include: {
        factions: true,
      },
    });

    if (!game) {
      throw new Error("Game not found...");
    }

    const factions = this.shuffleArray(game.factions);

    const factionContexts = factions.map((faction) => {
      return {
        id: faction.id,
        base_location: {
          x: faction.baseIndex % Config.getWidth(),
          y: Math.floor(faction.baseIndex / Config.getWidth()),
        },
        gold: faction.gold,
        land: faction.land,
        population: faction.population,
        populationCap: Config.getPopulationCap(),
        kills: faction.kills,
        score: faction.score,
        destroyed: faction.destroyed,
        currentUpkeep: faction.currentUpkeep,
      };
    });

    const gameContext: GameContext = {
      id: game.id,
      name: game.name,
      height: game.height,
      width: game.width,
      amountOfMoves: game.amountOfMoves,
      unitHealth: unitHealth,
      unitCost: unitCost,
      unitMoveCost: unitMoveCost,
    };

    for (const factionContext of factionContexts) {
      const url = Config.getFactionUrl(factionContext.id);

      try{
        const baseMove = await ApiBaseMove.PostBaseMove(
          url,
          gameContext,
          factionContext
        );
          // update faction accordingly
      }catch(e){
        this.log.error(e);
      }
    }
  }

  async endGame() {
    this.log.info("Ending game...");
    this.amountOfMoves = 0;

    await this.deleteGamesAfterLastThree();
    this.startGame();
  }

  private async deleteGamesAfterLastThree() {
    const games = await this.prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    if (games.length < 3) {
      return;
    }

    const gamesToDelete = await this.prisma.game.findMany({
      where: {
        createdAt: {
          lt: games[2].createdAt,
        },
      },
      include: {
        factions: true,
      },
    });

    if (gamesToDelete.length === 0) {
      return;
    }

    const stats = [];
    for (const game of gamesToDelete) {
      const factions = game.factions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      stats.push(
        this.prisma.gameStats.create({
          data: {
            id: game.id,
            name: game.name,
            winner: factions[0].id,
            second: factions[1].id,
            third: factions[2].id,
            winnerScore: factions[0].score,
            secondScore: factions[1].score,
            thirdScore: factions[2].score,
          },
        })
      );
    }

    this.prisma.$transaction([
      ...stats,
      ...gamesToDelete.map((game) =>
        this.prisma.game.delete({
          where: {
            id: game.id,
          },
        })
      ),
    ]);
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
