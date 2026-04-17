-- Collapse any pre-existing duplicate tiktokPostId rows, keeping the earliest
-- row for each post id. Without this, adding UNIQUE on a table that has
-- duplicates from the old webhook race would fail.
DELETE FROM "ContentItem"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT "id",
           ROW_NUMBER() OVER (
             PARTITION BY "tiktokPostId"
             ORDER BY "createdAt" ASC, "id" ASC
           ) AS rn
    FROM "ContentItem"
    WHERE "tiktokPostId" IS NOT NULL
  ) dedup
  WHERE dedup.rn > 1
);

CREATE UNIQUE INDEX "ContentItem_tiktokPostId_key" ON "ContentItem"("tiktokPostId");
