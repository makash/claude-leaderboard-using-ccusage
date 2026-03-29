import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create org
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme",
      domain: "acme.com",
      plan: "PRO",
    },
  });

  // Create users
  const users = await Promise.all([
    prisma.user.create({ data: { email: "alice@acme.com", name: "Alice Chen", role: "OWNER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "bob@acme.com", name: "Bob Smith", role: "ADMIN", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "carol@acme.com", name: "Carol Wu", role: "MANAGER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "david@acme.com", name: "David Kim", role: "MEMBER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "eve@acme.com", name: "Eve Johnson", role: "MEMBER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "frank@acme.com", name: "Frank Li", role: "MEMBER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "grace@acme.com", name: "Grace Park", role: "MANAGER", orgId: org.id, isActive: true } }),
    prisma.user.create({ data: { email: "henry@acme.com", name: "Henry Zhang", role: "MEMBER", orgId: org.id, isActive: true } }),
  ]);

  // Create teams
  const frontend = await prisma.team.create({ data: { name: "Frontend", slug: "frontend", orgId: org.id, description: "Frontend engineering team" } });
  const backend = await prisma.team.create({ data: { name: "Backend", slug: "backend", orgId: org.id, description: "Backend engineering team" } });
  const platform = await prisma.team.create({ data: { name: "Platform", slug: "platform", orgId: org.id, description: "Platform & infrastructure team" } });

  // Assign to teams
  await Promise.all([
    prisma.teamMember.create({ data: { teamId: frontend.id, userId: users[0].id, role: "LEAD" } }),
    prisma.teamMember.create({ data: { teamId: frontend.id, userId: users[3].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: frontend.id, userId: users[4].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: backend.id, userId: users[1].id, role: "LEAD" } }),
    prisma.teamMember.create({ data: { teamId: backend.id, userId: users[5].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: backend.id, userId: users[6].id, role: "MEMBER" } }),
    prisma.teamMember.create({ data: { teamId: platform.id, userId: users[2].id, role: "LEAD" } }),
    prisma.teamMember.create({ data: { teamId: platform.id, userId: users[7].id, role: "MEMBER" } }),
  ]);

  // Generate 30 days of Claude usage
  for (const user of users) {
    const baseCost = 5 + Math.random() * 45;
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const dayCost = baseCost * (0.5 + Math.random());
      const inputTokens = Math.floor(dayCost * 15000 + Math.random() * 10000);
      const outputTokens = Math.floor(dayCost * 5000 + Math.random() * 5000);
      const cacheRead = Math.floor(inputTokens * (0.2 + Math.random() * 0.4));
      const cacheCreation = Math.floor(inputTokens * 0.05);
      await prisma.claudeUsage.create({
        data: {
          userId: user.id, date: dateStr, source: "default",
          inputTokens, outputTokens, cacheCreationTokens: cacheCreation,
          cacheReadTokens: cacheRead, totalTokens: inputTokens + outputTokens + cacheRead + cacheCreation,
          costUsd: Math.round(dayCost * 100) / 100, modelsUsed: ["claude-sonnet-4-6", "claude-opus-4-6"],
        },
      });
    }
  }

  // Generate 30 days of Codex usage
  for (const user of users) {
    const baseTasks = 5 + Math.floor(Math.random() * 15);
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const tasks = Math.floor(baseTasks * (0.5 + Math.random()));
      const failed = Math.floor(tasks * (0.05 + Math.random() * 0.15));
      await prisma.codexUsage.create({
        data: {
          userId: user.id, date: dateStr, source: "default",
          tasksCompleted: tasks, tasksFailed: failed,
          tokensUsed: tasks * 8000 + Math.floor(Math.random() * 5000),
          costUsd: Math.round(tasks * 0.8 * 100) / 100,
          avgDurationSeconds: 30 + Math.random() * 120,
          languagesUsed: ["TypeScript", "Python", "Go"].slice(0, 1 + Math.floor(Math.random() * 3)),
        },
      });
    }
  }

  // Create sample evaluations
  const now = new Date();
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
  await Promise.all([
    prisma.evaluation.create({ data: { userId: users[3].id, evaluatorId: users[0].id, periodStart: monthAgo, periodEnd: now, claudeScore: 8, codexScore: 7, productivityScore: 9, qualityScore: 8, overallScore: 8, strengths: "Excellent prompt engineering", improvements: "Could improve Codex task scoping", status: "SUBMITTED" } }),
    prisma.evaluation.create({ data: { userId: users[4].id, evaluatorId: users[0].id, periodStart: monthAgo, periodEnd: now, claudeScore: 7, codexScore: 9, productivityScore: 8, qualityScore: 8, overallScore: 8, strengths: "Great at Codex automation", improvements: "Work on cache optimization", status: "ACKNOWLEDGED" } }),
    prisma.evaluation.create({ data: { userId: users[5].id, evaluatorId: users[1].id, periodStart: monthAgo, periodEnd: now, claudeScore: 9, codexScore: 8, productivityScore: 9, qualityScore: 9, overallScore: 9, strengths: "Top performer across all AI tools", status: "SUBMITTED" } }),
  ]);

  console.log("Seed complete: 1 org, 8 users, 3 teams, 240 claude usage records, 240 codex usage records, 3 evaluations");
}

main().catch(console.error).finally(() => prisma.$disconnect());
