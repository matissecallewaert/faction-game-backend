import { Config } from "../../Config";
import { faker } from "@faker-js/faker";
import { PrismaClient, RESOURCETYPE, UNITTYPE, Unit } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { GameContext } from "../../objects/GameContext";
import {
  unitCost,
  unitHealth,
  unitMoveCost,
  unitUpkeep,
} from "../../constants/constants";
import ApiBaseMove from "../../api/ApiBaseMove";
import { FactionLogic } from "../faction/factionLogic";
import { FactionContext } from "../../objects/FactionContext";
import { UnitContext } from "../../objects/Unit";
import ApiUnitMove from "../../api/ApiUnitMove";
import { UnitLogic } from "../unit/UnitLogic";

export class GameLogic {
  private prisma: PrismaClient;
  private log: FastifyBaseLogger;
  private currentGame: string = "";
  private amountOfMoves: number = 0;
  private factionLogic: FactionLogic;
  private unitLogic: UnitLogic;
  private interval: NodeJS.Timeout | undefined;

  constructor(prisma: PrismaClient, log: FastifyBaseLogger) {
    this.prisma = prisma;
    this.log = log;
    this.factionLogic = new FactionLogic(log);
    this.unitLogic = new UnitLogic(log);
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
          health: 3,
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

      const resultUnits: Unit[] = [];

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

      const currentGame = await this.prisma.currentGame.findUnique({
        where: {
          id: 1,
        },
      });
      if (!currentGame) {
        await this.prisma.currentGame.create({
          data: {
            id: 1,
            gameId: game.id,
            gameName: game.name,
          },
        });
      } else {
        await this.prisma.currentGame.update({
          where: {
            id: 1,
          },
          data: {
            gameId: game.id,
            gameName: game.name,
          },
        });
      }

      this.log.info("Game initialized!");
      this.interval = setInterval(async () => {
        await this.BaseMoves();
        await this.UnitMoves();
      }, 5000);
    } catch (e) {
      this.log.error(e);
      throw new Error("Game could not be initialized...");
    }
  }

  private async BaseMoves() {
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
    const indexes = factions.map((faction) => faction.baseIndex);

    const units = await this.prisma.unit.findMany({
      where: {
        gameId: this.currentGame,
        index: {
          in: indexes,
        },
      },
    });

    const factionContexts: FactionContext[] = factions
      .filter((faction) => !faction.destroyed)
      .map((faction) => {
        return {
          id: faction.id,
          base_location: {
            x: faction.baseIndex % Config.getWidth(),
            y: Math.floor(faction.baseIndex / Config.getWidth()),
            unit: units
              .filter((unit) => unit.index === faction.baseIndex)
              .map((unit) => ({
                type: unit.type,
                health: unit.health,
                index: unit.index,
                factionId: unit.factionId,
                gameId: unit.gameId,
              }))[0],
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

    const factionsToUpdate = [];
    const unitsToCreate = [];
    for (const factionContext of factionContexts) {
      const url = Config.getFactionUrl(factionContext.id);

      try {
        const baseMove = await ApiBaseMove.PostBaseMove(
          url,
          gameContext,
          factionContext
        );

        const result = await this.factionLogic.executeBaseMove(
          baseMove,
          game.id,
          factionContext
        );

        factionsToUpdate.push(
          this.prisma.faction.update({
            where: {
              id_gameId: {
                id: result.faction.id,
                gameId: game.id,
              },
            },
            data: {
              gold: result.faction.gold,
              population: result.faction.population,
              score: result.faction.score,
              currentUpkeep: result.faction.currentUpkeep,
            },
          })
        );
        if (result.unit) {
          unitsToCreate.push(this.prisma.unit.create({ data: result.unit }));
        }
      } catch (e) {
        this.log.error(e);
        throw e;
      }
    }
    try {
      const createdUnits = await this.prisma.$transaction([
        ...factionsToUpdate,
        ...unitsToCreate,
      ]);

      try {
        const resultingUnits = createdUnits
          .filter((unit) => typeof unit.id === "string")
          .map((unit) => unit as Unit);

        const tilesToUpdate = await this.prisma.tile.findMany({
          where: {
            gameId: this.currentGame,
            id: {
              in: resultingUnits.map((unit) => unit.index),
            },
          },
        });

        const tilesToUpdatePromises = tilesToUpdate.map((tile) => {
          return this.prisma.tile.update({
            where: {
              id_gameId: {
                id: tile.id,
                gameId: tile.gameId,
              },
            },
            data: {
              unit: resultingUnits.filter((unit) => unit.index === tile.id)[0]
                .id,
            },
          });
        });

        await this.prisma.$transaction([...tilesToUpdatePromises]);
      } catch (e) {
        this.log.error(e);
        // Add fallback mechanism
      }
    } catch (e) {
      this.log.error(e);
    }
  }

  private async UnitMoves() {
    const game = await this.prisma.game.findUnique({
      where: {
        id: this.currentGame,
      },
      include: {
        factions: true,
        tiles: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!game) {
      throw new Error("Game not found...");
    }

    const factions = game.factions;
    const tiles = game.tiles;
    const units = await this.prisma.unit.findMany({
      where: {
        gameId: this.currentGame,
      },
    });

    const factionContexts: FactionContext[] = factions
      .filter((faction) => !faction.destroyed)
      .map((faction) => {
        return {
          id: faction.id,
          base_location: {
            x: faction.baseIndex % Config.getWidth(),
            y: Math.floor(faction.baseIndex / Config.getWidth()),
            unit: units
              .filter((unit) => unit.index === faction.baseIndex)
              .map((unit) => ({
                type: unit.type,
                health: unit.health,
                index: unit.index,
                factionId: unit.factionId,
                gameId: unit.gameId,
              }))[0],
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

    const unitContexts: UnitContext[] = this.shuffleArray(
      units.map((unit) => {
        const neightbourLocations = tiles
          .filter((tile) => {
            return (
              tile.id === unit.index - 1 ||
              tile.id === unit.index + 1 ||
              tile.id === unit.index - Config.getWidth() ||
              tile.id === unit.index + Config.getWidth() ||
              tile.id === unit.index - Config.getWidth() - 1 ||
              tile.id === unit.index - Config.getWidth() + 1 ||
              tile.id === unit.index + Config.getWidth() - 1 ||
              tile.id === unit.index + Config.getWidth() + 1
            );
          })
          .map((tile) => {
            return {
              x: tile.id % Config.getWidth(),
              y: Math.floor(tile.id / Config.getWidth()),
              unit: units
                .filter((unit) => unit.index === tile.id)
                .map((unit) => ({
                  type: unit.type,
                  health: unit.health,
                  index: unit.index,
                  factionId: unit.factionId,
                  gameId: unit.gameId,
                }))[0],
            };
          });

        return {
          id: unit.id,
          type: unit.type,
          health: unit.health,
          factionId: unit.factionId,
          location: {
            x: unit.index % Config.getWidth(),
            y: Math.floor(unit.index / Config.getWidth()),
            unit: {
              type: unit.type,
              health: unit.health,
              factionId: unit.factionId,
              gameId: unit.gameId,
            },
          },
          neightbourLocations: neightbourLocations,
        };
      })
    );

    const factionsToUpdate = [];
    const unitsToUpdate = [];
    const unitsToDelete = [];
    const tilesToUpdateIds: number[] = [];

    for (const unitContext of unitContexts) {
      const url = Config.getFactionUrl(unitContext.factionId);

      try {
        const unitMove = await ApiUnitMove.PostUnitMove(
          url,
          gameContext,
          factionContexts.filter(
            (faction) => faction.id === unitContext.factionId
          )[0],
          unitContext
        );

        this.unitLogic.executeUnitMove(
          unitMove,
          factionContexts,
          unitContexts,
          tiles,
          tilesToUpdateIds,
          unitContext.id
        );
      } catch (e) {
        this.log.error(e);
      }
    }

    for (const unit of unitContexts) {
      const faction = factionContexts.filter(
        (faction) => faction.id === unit.factionId
      )[0];
      if (unit.health <= 0 || faction.destroyed) {
        unitsToDelete.push(
          this.prisma.unit.delete({
            where: {
              id: unit.id,
            },
          })
        );
        continue;
      }

      unitsToUpdate.push(
        this.prisma.unit.update({
          where: {
            id: unit.id,
          },
          data: {
            health: unit.health,
            index: unit.location.y * Config.getWidth() + unit.location.x,
          },
        })
      );
    }

    for (const faction of factionContexts) {
      if (faction.destroyed) {
        tiles
          .filter((tile) => tile.factionId === faction.id)
          .forEach((tile) => {
            tile.factionId = -1;
            tilesToUpdateIds.push(tile.id);
          });
      }
      factionsToUpdate.push(
        this.prisma.faction.update({
          where: {
            id_gameId: {
              id: faction.id,
              gameId: game.id,
            },
          },
          data: {
            gold: faction.gold,
            land: faction.land,
            population: faction.population,
            kills: faction.kills,
            score: faction.score,
            destroyed: faction.destroyed,
            currentUpkeep: units
              .filter((unit) => unit.factionId === faction.id)
              .reduce((acc, unit) => acc + (unitUpkeep.get(unit.type) || 0), 0),
          },
        })
      );
    }

    const updatedTiles = tiles.filter((tile) =>
      tilesToUpdateIds.includes(tile.id)
    );

    const tilesToUpdate = updatedTiles.map((tile) => {
      return this.prisma.tile.update({
        where: {
          id_gameId: {
            id: tile.id,
            gameId: tile.gameId,
          },
        },
        data: {
          unit: tile.unit,
          factionId: tile.factionId,
        },
      });
    });

    try {
      await this.prisma.$transaction([
        ...factionsToUpdate,
        ...unitsToUpdate,
        ...unitsToDelete,
        ...tilesToUpdate,
      ]);
    } catch (e) {
      this.log.error(e);
    }
    this.amountOfMoves++;

    if (this.amountOfMoves === 500) {
      this.endGame();
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
