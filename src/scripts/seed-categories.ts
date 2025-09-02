import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Next.js",
  "Node.js",
  "Web Development",
  "Mobile Development",
  "Other",
];

async function main() {
  console.log("Seeding categories...");
  try {
    for (const name of categoryNames) {
      await db.insert(categories).values({
        name,
        description: `Videos related to ${name}`,
      });
    }
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

main();
