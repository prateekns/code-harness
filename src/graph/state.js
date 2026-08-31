import { z } from "zod";
import { StateSchema } from "@langchain/langgraph";

const TaskSchema = z.object({
  id: z.number().nullable(),
  reference: z.number().nullable().default(null),
  title: z.string().default(""),
  description: z.string().default(""),

  status: z.object({
    id: z.number().nullable(),
    name: z.string().default(""),
    workflow: z.string().nullable().default(""), 
  }).optional(),

  project: z.object({
    id: z.number().nullable(),
    name: z.string().default(null),
  }).optional(),
});

export const CodingTaskState = new StateSchema({
  provider: z.enum([
      "taiga",
      "asana",
    ]).default("taiga"),

  task: TaskSchema,

  analysis: z.string().default(""),

  plan: z.string().default(""),

  planVersion: z.number().int().min(0).default(0),
  planCommentId:z.string().nullable().default(null),

  planFeedback: z.string().default(""),

  planPostedAt: z.string().nullable().default(null),

  planStatus: z.enum([
      "pending",
      "approved",
      "needs_work",
    ]).default("pending"),

  workflowStatus: z.enum([
      "planning",
      "waiting_for_plan_decision",
      "plan_approved",
      "waiting_for_coding",
      "coding",
      "completed",
      "failed",
    ]).default("planning"),
});



/*import { StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const TaskSchema = z.object({
  id: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  status: z.string().default(""),
  workflowStatus: z.string().nullable().default(null),
});

export const CodingTaskState = new StateSchema({
  task: TaskSchema,

  analysis: z.string().default(""),

  plan: z.string().default(""),

  planVersion: z.number().int().min(0).default(0),

  planFeedback: z.string().default(""),

  planPostedAt: z.string().nullable().default(null),

  planStatus: z.enum([
    "pending",
    "approved",
    "needs_work",
    ]).default("pending"),

 workflowStatus: z.enum([
    "planning",
    "waiting_for_plan_decision",
    "plan_approved",
    "waiting_for_coding",
    "coding",
    "completed",
    "failed",
    ]).default("planning"),
});*/