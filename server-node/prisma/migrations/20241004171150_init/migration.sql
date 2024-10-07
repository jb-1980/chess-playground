-- CreateEnum
CREATE TYPE "Square" AS ENUM ('a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('w', 'b');

-- CreateEnum
CREATE TYPE "Piece" AS ENUM ('p', 'n', 'b', 'r', 'q', 'k');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('NOT_STARTED', 'JOINING', 'PLAYING', 'CHECKMATE', 'STALEMATE', 'THREE_MOVE_REPETITION', 'INSUFFICIENT_MATERIAL', 'FIFTY_MOVE_RULE', 'RESIGNATION', 'AGREED_DRAW', 'TIMEOUT', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('WHITE_WINS', 'BLACK_WINS', 'DRAW');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "avatarUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "color" "Color" NOT NULL,
    "from" "Square" NOT NULL,
    "to" "Square" NOT NULL,
    "piece" "Piece" NOT NULL,
    "captured" "Piece",
    "promotion" "Piece",
    "flags" TEXT NOT NULL,
    "san" TEXT NOT NULL,
    "lan" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "pgn" TEXT NOT NULL,
    "whitePlayerId" INTEGER NOT NULL,
    "blackPlayerId" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "outcome" "Outcome" NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameOutcomes" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "whiteWinsWhiteRating" INTEGER NOT NULL,
    "whiteWinsBlackRating" INTEGER NOT NULL,
    "blackWinsWhiteRating" INTEGER NOT NULL,
    "blackWinsBlackRating" INTEGER NOT NULL,
    "drawWhiteRating" INTEGER NOT NULL,
    "drawBlackRating" INTEGER NOT NULL,

    CONSTRAINT "GameOutcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameOutcomes" ADD CONSTRAINT "GameOutcomes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
