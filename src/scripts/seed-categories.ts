import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "Cars and vehicles",
  "Real estate",
  "Jobs and employment",
  "Personal services",
  "Business and services",
  "Community and events",
  "For sale",
  "Housing and apartments",
  "Pets and animals",
  "Electronics and appliances",
  "Furniture and decor",
  "Health and beauty",
  "Toys and games",
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
