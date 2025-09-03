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
  "AI & Machine Learning",
  "DevOps",
  "Database",
  "Cloud Computing",
  "Cybersecurity",
  "Game Development",
  "Data Science",
  "Blockchain",
  "IoT",
  "Design",
  "Tutorials",
  "Interviews",
  "Tech News",
  "Entertainment",
  "Music",
  "Sports",
  "Education",
  "Business",
  "Marketing",
  "Freelancing",
  "Other",
];

async function main() {
  console.log("Seeding categories...");
  try {
    await db.delete(categories);
    for (const name of categoryNames) {
      await db.insert(categories).values({
        name,
        description: `Videos related to ${name}`,
      });
    }
    console.log("Categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

main();
