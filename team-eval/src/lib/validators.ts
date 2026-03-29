import { z } from "zod";

// --- Organization ---

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(100, "Organization name must be 100 characters or fewer"),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

// --- Invite Member ---

export const inviteMemberSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  role: z.enum(["admin", "manager", "member", "viewer"], {
    required_error: "Role is required",
  }),
  teamIds: z.array(z.string().uuid()).optional(),
  message: z.string().max(300, "Message must be 300 characters or fewer").optional(),
});

export type InviteMember = z.infer<typeof inviteMemberSchema>;

// --- Upload Claude Usage ---

export const uploadClaudeUsageSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  file: z
    .instanceof(File, { message: "A CSV file is required" })
    .refine((f) => f.type === "text/csv" || f.name.endsWith(".csv"), "File must be a CSV")
    .refine((f) => f.size <= 10 * 1024 * 1024, "File must be 10 MB or smaller"),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).refine((p) => p.start < p.end, "Start date must be before end date"),
  source: z.enum(["claude_api", "claude_chat", "claude_code"]).default("claude_api"),
});

export type UploadClaudeUsage = z.infer<typeof uploadClaudeUsageSchema>;

// --- Upload Codex Usage ---

export const uploadCodexUsageSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  file: z
    .instanceof(File, { message: "A file is required" })
    .refine(
      (f) => f.type === "text/csv" || f.type === "application/json" || f.name.endsWith(".csv") || f.name.endsWith(".json"),
      "File must be a CSV or JSON file",
    )
    .refine((f) => f.size <= 10 * 1024 * 1024, "File must be 10 MB or smaller"),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).refine((p) => p.start < p.end, "Start date must be before end date"),
});

export type UploadCodexUsage = z.infer<typeof uploadCodexUsageSchema>;

// --- Create Evaluation ---

export const createEvaluationSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  memberId: z.string().uuid("Invalid member ID"),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).refine((p) => p.start < p.end, "Start date must be before end date"),
  scores: z.object({
    codeQuality: z.number().min(0).max(10, "Score must be between 0 and 10"),
    productivity: z.number().min(0).max(10, "Score must be between 0 and 10"),
    collaboration: z.number().min(0).max(10, "Score must be between 0 and 10"),
    aiUtilization: z.number().min(0).max(10, "Score must be between 0 and 10"),
    communication: z.number().min(0).max(10, "Score must be between 0 and 10"),
  }),
  notes: z.string().max(2000, "Notes must be 2000 characters or fewer").optional(),
  isPublished: z.boolean().default(false),
});

export type CreateEvaluation = z.infer<typeof createEvaluationSchema>;

// --- Update Profile ---

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name must be 100 characters or fewer"),
  title: z.string().max(100, "Title must be 100 characters or fewer").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or fewer").optional().or(z.literal("")),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  timezone: z.string().max(50).optional(),
  githubUsername: z.string().max(39, "GitHub username must be 39 characters or fewer").regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, "Invalid GitHub username").optional().or(z.literal("")),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// --- Create Team ---

export const createTeamSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name must be 100 characters or fewer"),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional(),
  memberIds: z.array(z.string().uuid()).optional(),
});

export type CreateTeam = z.infer<typeof createTeamSchema>;
