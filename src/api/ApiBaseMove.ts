import { BASEMOVETYPE } from "../constants/BaseMoveType";
import { FactionContext } from "../objects/FactionContext";
import { GameContext } from "../objects/GameContext";
import ApiInstance from "./ApiInstance";

class BaseMoveApi {
  public async PostBaseMove(faction_url: string, gameContext: GameContext, FactionContext: FactionContext): Promise<BASEMOVETYPE> {
    // const response = await ApiInstance.getApi(faction_url).post("/basemove", {
    //     gameContext: gameContext,
    //     factionContext: FactionContext,
    // });
    // return response.data.data;

    return BASEMOVETYPE.IDLE;
  }
}

export default new BaseMoveApi();