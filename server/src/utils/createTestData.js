import { seedSampleData } from "../services/sampleSeedService.js";

export async function createTestData() {
  return seedSampleData();
}

export async function createTestDataForUser() {
  return createTestData();
}
