import { UNITMOVETYPE } from "../constants/UnitMoveType";
import { FactionContext } from "../objects/FactionContext";
import { GameContext } from "../objects/GameContext";
import { Location } from "../objects/Location";
import { UnitContext } from "../objects/Unit";
import ApiInstance from "./ApiInstance";

export type PostUnitMoveResponse = {
  unitMoveType: UNITMOVETYPE;
  location?: Location;
};

class BaseUnitApi {
  public async PostUnitMove(
    faction_url: string,
    gameContext: GameContext,
    factionContext: FactionContext,
    unitContext: UnitContext
  ): Promise<PostUnitMoveResponse> {
    // const response = await ApiInstance.getApi(faction_url).post("/unitmove", {
    //     gameContext: gameContext,
    //     factionContext: FactionContext,
    //     unitContext: unitContext,
    // });
    // return response.data.data;

    return { unitMoveType: UNITMOVETYPE.IDLE };
  }
}

export default new BaseUnitApi();
