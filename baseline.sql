-- DropForeignKey
ALTER TABLE "public"."reflections" DROP CONSTRAINT "reflections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_reflection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reflection_comments" DROP CONSTRAINT "reflection_comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reflection_comments" DROP CONSTRAINT "reflection_comments_reflection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reflection_likes" DROP CONSTRAINT "reflection_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reflection_likes" DROP CONSTRAINT "reflection_likes_reflection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."journals" DROP CONSTRAINT "journals_user_id_fkey";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."reflections";

-- DropTable
DROP TABLE "public"."likes";

-- DropTable
DROP TABLE "public"."reflection_comments";

-- DropTable
DROP TABLE "public"."reflection_likes";

-- DropTable
DROP TABLE "public"."journals";

