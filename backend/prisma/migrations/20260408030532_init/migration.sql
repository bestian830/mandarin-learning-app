-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "student_core" (
    "userId" TEXT NOT NULL,
    "nativeLanguage" TEXT NOT NULL DEFAULT 'en',
    "uiLanguage" TEXT NOT NULL DEFAULT 'en',
    "hskLevelSelf" INTEGER NOT NULL DEFAULT 0,
    "learningGoal" TEXT,
    "interestTags" TEXT[],
    "conversationStyle" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_core_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "student_rolling_summary" (
    "userId" TEXT NOT NULL,
    "summaryText" TEXT,
    "basedOnLessons" INTEGER,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_rolling_summary_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "student_recent_lessons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "classmateSług" TEXT,
    "shortSummary" TEXT,
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_recent_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classmates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameZh" TEXT,
    "nameOrigin" TEXT,
    "country" TEXT,
    "countryFlag" TEXT,
    "nativeLanguage" TEXT,
    "speaksLanguages" TEXT[],
    "backgroundStory" TEXT,
    "personalityTags" TEXT[],
    "avatarUrl" TEXT,
    "engine" TEXT NOT NULL,
    "voiceId" TEXT,
    "voiceDescription" TEXT,
    "price5minUsd" DECIMAL(5,2),
    "price15minUsd" DECIMAL(5,2),
    "price25minUsd" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "promptTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classmates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_archive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classmateId" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "transcript" JSONB,
    "aiSummary" TEXT,
    "costUsd" DECIMAL(8,4),
    "paidAmountUsd" DECIMAL(5,2),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_archive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pinyin" TEXT,
    "definition" TEXT,
    "source" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEncounteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encounterCount" INTEGER NOT NULL DEFAULT 1,
    "inWordBook" BOOLEAN NOT NULL DEFAULT false,
    "hskLevel" INTEGER,

    CONSTRAINT "vocab_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_decks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_flashcards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "word" TEXT,
    "pinyin" TEXT,
    "definition" TEXT,
    "box" INTEGER NOT NULL DEFAULT 1,
    "nextReview" TIMESTAMP(3),
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hsk_words" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pinyin" TEXT,
    "definition" TEXT,
    "pos" TEXT,
    "level" INTEGER NOT NULL,
    "exampleZh" TEXT,
    "audioUrl" TEXT,
    "displayOrder" INTEGER,

    CONSTRAINT "hsk_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_balance" (
    "userId" TEXT NOT NULL,
    "balanceUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalRecharged" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalConsumed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_balance_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "balance_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountUsd" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "relatedLessonId" TEXT,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_cache" (
    "lang" VARCHAR(20) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "i18n_cache_pkey" PRIMARY KEY ("lang")
);

-- CreateTable
CREATE TABLE "word_stats" (
    "word" VARCHAR(50) NOT NULL,
    "traditional" VARCHAR(50),
    "pinyin" VARCHAR(100),
    "category" VARCHAR(20),
    "count" INTEGER NOT NULL DEFAULT 1,
    "pinyinOverride" VARCHAR(100),
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_stats_pkey" PRIMARY KEY ("word")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "student_recent_lessons_userId_createdAt_idx" ON "student_recent_lessons"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "classmates_slug_key" ON "classmates"("slug");

-- CreateIndex
CREATE INDEX "lesson_archive_userId_startedAt_idx" ON "lesson_archive"("userId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "vocab_log_userId_lastEncounteredAt_idx" ON "vocab_log"("userId", "lastEncounteredAt" DESC);

-- CreateIndex
CREATE INDEX "vocab_log_userId_inWordBook_idx" ON "vocab_log"("userId", "inWordBook");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_log_userId_word_key" ON "vocab_log"("userId", "word");

-- CreateIndex
CREATE INDEX "user_decks_userId_idx" ON "user_decks"("userId");

-- CreateIndex
CREATE INDEX "user_flashcards_deckId_idx" ON "user_flashcards"("deckId");

-- CreateIndex
CREATE INDEX "hsk_words_level_displayOrder_idx" ON "hsk_words"("level", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "hsk_words_word_level_key" ON "hsk_words"("word", "level");

-- CreateIndex
CREATE INDEX "balance_transactions_userId_createdAt_idx" ON "balance_transactions"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "word_stats_count_idx" ON "word_stats"("count" DESC);

-- CreateIndex
CREATE INDEX "word_stats_category_idx" ON "word_stats"("category");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_core" ADD CONSTRAINT "student_core_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_rolling_summary" ADD CONSTRAINT "student_rolling_summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_recent_lessons" ADD CONSTRAINT "student_recent_lessons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_archive" ADD CONSTRAINT "lesson_archive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_archive" ADD CONSTRAINT "lesson_archive_classmateId_fkey" FOREIGN KEY ("classmateId") REFERENCES "classmates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_log" ADD CONSTRAINT "vocab_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_decks" ADD CONSTRAINT "user_decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_flashcards" ADD CONSTRAINT "user_flashcards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "user_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balance" ADD CONSTRAINT "user_balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_relatedLessonId_fkey" FOREIGN KEY ("relatedLessonId") REFERENCES "lesson_archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;
