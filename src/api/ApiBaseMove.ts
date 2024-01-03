import { BASEMOVETYPE } from "../constants/BaseMoveType";
import { FactionContext } from "../objects/FactionContext";
import { GameContext } from "../objects/GameContext";
import { UNITTYPE } from "../prisma";
import ApiInstance from "./ApiInstance";

export type PostBaseMoveResponse = {
  baseMoveType: BASEMOVETYPE;
  unitType?: UNITTYPE;
};

class BaseMoveApi {
  public async PostBaseMove(
    faction_url: string,
    gameContext: GameContext,
    FactionContext: FactionContext
  ): Promise<PostBaseMoveResponse> {
    // const response = await ApiInstance.getApi(faction_url).post("/basemove", {
    //     gameContext: gameContext,
    //     factionContext: FactionContext,
    // });
    // return response.data.data;

    return {
      baseMoveType: BASEMOVETYPE.IDLE,
    };
  }
}

export default new BaseMoveApi();
