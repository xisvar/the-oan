-- CreateTable
CREATE TABLE "LedgerEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StudentIdentity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jamb_reg_number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "state_of_origin" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "preferred_schools" TEXT NOT NULL,
    "intended_stream" TEXT NOT NULL,
    "behavior_tag" TEXT,
    CONSTRAINT "StudentProfile_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "exam_type" TEXT NOT NULL,
    "exam_year" INTEGER NOT NULL,
    "subjects" TEXT NOT NULL,
    CONSTRAINT "ExamResult_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UTMEResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "jamb_score" INTEGER NOT NULL,
    "subject_combo" TEXT NOT NULL,
    "post_utme_score" INTEGER,
    CONSTRAINT "UTMEResult_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StreamClassification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StreamClassification_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rank_nigeria" INTEGER NOT NULL,
    "rank_world" TEXT NOT NULL,
    "teaching_score" REAL NOT NULL,
    "research_env" REAL NOT NULL,
    "research_quality" REAL NOT NULL,
    "industry" REAL NOT NULL,
    "international_outlook" REAL NOT NULL,
    "global_profile" TEXT
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "school_id" TEXT NOT NULL,
    "program_name" TEXT NOT NULL,
    "quota_total" INTEGER NOT NULL,
    "quota_merit" INTEGER NOT NULL,
    "quota_catchment" INTEGER NOT NULL,
    "quota_elds" INTEGER NOT NULL,
    "base_cutoff" INTEGER NOT NULL,
    CONSTRAINT "Program_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Eligibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "is_eligible" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "computed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Eligibility_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Eligibility_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeritRanking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "merit_score" REAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "batch_id" TEXT NOT NULL,
    CONSTRAINT "MeritRanking_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MeritRanking_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdmissionDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "decision_reason" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdmissionDecision_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdmissionDecision_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentIdentity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEvent_hash_key" ON "LedgerEvent"("hash");

-- CreateIndex
CREATE INDEX "LedgerEvent_hash_idx" ON "LedgerEvent"("hash");

-- CreateIndex
CREATE INDEX "LedgerEvent_prevHash_idx" ON "LedgerEvent"("prevHash");

-- CreateIndex
CREATE UNIQUE INDEX "StudentIdentity_jamb_reg_number_key" ON "StudentIdentity"("jamb_reg_number");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_student_id_key" ON "StudentProfile"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "UTMEResult_student_id_key" ON "UTMEResult"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamClassification_student_id_key" ON "StreamClassification"("student_id");
