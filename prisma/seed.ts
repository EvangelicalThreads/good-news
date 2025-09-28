import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const goodNewsData = [
    {
      id: "11111111-1111-1111-1111-111111111111", // fixed UUID for repeatable seed
      title: "Faith Over Fear",
      content: "Trust God even when the path is unclear.",
      image_url: "https://example.com/image1.jpg",
      date: new Date("2025-08-10"),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Grace and Peace",
      content: "God’s grace is enough for every trial.",
      image_url: "https://example.com/image2.jpg",
      date: new Date("2025-08-11"),
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "Hope in Darkness",
      content: "Light shines brightest in the darkest places.",
      image_url: "https://example.com/image3.jpg",
      date: new Date("2025-08-12"),
    },
  ];

  for (const item of goodNewsData) {
    await prisma.good_news.upsert({
      where: { id: item.id }, // Use id here, required by Prisma
      update: {}, // nothing to update on seed
      create: item,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
