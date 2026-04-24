-- Onboarding 改版：删掉 interestTags 和 learningGoal 自由文本，
-- 加上 learningGoals 标签数组，把 nativeLanguage 改为可空（onboarding 未完成时为 NULL）

ALTER TABLE "student_core" DROP COLUMN "interestTags";
ALTER TABLE "student_core" DROP COLUMN "learningGoal";

ALTER TABLE "student_core" ADD COLUMN "learningGoals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "student_core" ALTER COLUMN "nativeLanguage" DROP NOT NULL;
ALTER TABLE "student_core" ALTER COLUMN "nativeLanguage" DROP DEFAULT;
