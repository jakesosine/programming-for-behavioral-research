import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function parseCSV(filePath: string): Record<string, string>[] {
  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

const bool = (v: string) => v === "t";

async function main() {
  const dataDir = path.join(__dirname, "seed-data");
  const suffix = process.argv.includes("--synthetic") ? "Synthetic" : "";

  const participants = parseCSV(
    path.join(dataDir, `participants${suffix}.csv`)
  );
  for (const p of participants) {
    await prisma.participant.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        prolificId: p.prolificId,
        createdAt: new Date(p.createdAt),
        consented: bool(p.consented),
        comprehensionAttempts: parseInt(p.comprehensionAttempts),
        instructionsCompleted: bool(p.instructionsCompleted),
        taskCompleted: bool(p.taskCompleted),
      },
      update: {},
    });
  }
  console.log(`Seeded ${participants.length} participants`);

  const demographics = parseCSV(
    path.join(dataDir, `demographics${suffix}.csv`)
  );
  for (const d of demographics) {
    await prisma.demographics.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        participantId: d.participantId,
        age: parseInt(d.age),
        gender: d.gender,
        education: d.education,
        submittedAt: new Date(d.submittedAt),
      },
      update: {},
    });
  }
  console.log(`Seeded ${demographics.length} demographics`);

  const responses = parseCSV(path.join(dataDir, `responses${suffix}.csv`));
  for (const r of responses) {
    await prisma.response.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        participantId: r.participantId,
        phase: parseInt(r.phase),
        button: r.button,
        reinforced: bool(r.reinforced),
        respondedAt: new Date(r.respondedAt),
      },
      update: {},
    });
  }
  console.log(`Seeded ${responses.length} responses`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
