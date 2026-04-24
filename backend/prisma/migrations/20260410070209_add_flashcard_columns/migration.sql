-- AlterTable
ALTER TABLE "student_core" ALTER COLUMN "learningGoals" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_flashcards" ADD COLUMN     "context" TEXT,
ADD COLUMN     "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastReviewed" TIMESTAMP(3),
ADD COLUMN     "pos" TEXT,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "traditional" TEXT;
