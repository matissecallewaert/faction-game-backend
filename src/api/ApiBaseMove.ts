import { BASEMOVETYPE } from "../constants/BaseMoveType";
import { FactionContext } from "../objects/FactionContext";
import { GameContext } from "../objects/GameContext";
import { Tile, UNITTYPE } from "../prisma";
import ApiInstance from "./ApiInstance";

export type PostBaseMoveResponse = {
  baseMoveType: BASEMOVETYPE;
  unitType?: UNITTYPE;
};

class BaseMoveApi {
  public async PostBaseMove(
    faction_url: string,
    gameContext: GameContext,
    FactionContext: FactionContext,
    baseTile: Tile | undefined
  ): Promise<PostBaseMoveResponse> {
    // const response = await ApiInstance.getApi(faction_url).post("/basemove", {
    //     gameContext: gameContext,
    //     factionContext: FactionContext,
    //     baseTile: baseTile,
    // });
    // return response.data.data;

    const random = Math.random();
    if (random < 0.5) {
      return {
        baseMoveType: BASEMOVETYPE.IDLE,
      };
    } else if (random < 0.75) {
      return {
        baseMoveType: BASEMOVETYPE.RECEIVE_INCOME,
      };
    } else {
      return {
        baseMoveType: BASEMOVETYPE.START_BUILDING_UNIT,
        unitType: UNITTYPE.PIONEER,
      };
    }
  }
}

export default new BaseMoveApi();
