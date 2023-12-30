import { PrismaClient } from "./prisma";

async function seed(){
    const prisma = new PrismaClient();

    await prisma.game.deleteMany();
    await prisma.currentGame.deleteMany();

    const game = await prisma.game.create({
        data: {
            name: "Test",
            width: 10,
            height: 10,
            amountOfMoves: 0,
        },
    });

    await prisma.currentGame.create({
        data: {
            id: 1,
            gameId: game.id,
            gameName: game.name,
        },
    });
}

seed();