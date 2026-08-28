import { interrupt } from "@langchain/langgraph";
import { createLLM } from "../llm/index.js";
import { asana } from "../integrations/asana/index.js";
import { mapAsanaTask } from "../integrations/asana/mapper.js";

const llm = createLLM();

export const fetchTask = async (state) => {
  console.log("\n--- FETCH ASANA TASK ---");

  if (!state.task.id) {
    throw new Error("Asana task ID is required");
  }

  const response = await asana.getTask(
    state.task.id
  );

  const task = mapAsanaTask(response);

  console.log("Task:", task.title);
  console.log(
    "AI Coding Status:",
    task.workflowStatusField?.value ?? "NOT SET"
  );

  return {
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      workflowStatus: task.workflowStatusField?.value ?? null,
    },
  };
};

export const receiveTask = async (state) => {
  console.log("\n--- RECEIVE TASK ---");

  console.log("Title:", state.task.title);
  console.log("Description:", state.task.description);

  return {};
};

export const analyzeTask = async (state) => {
  console.log("\n--- ANALYZE TASK ---");

  const analysis = `
This task requires implementing a CSV export feature.
We need to understand the existing reporting system,
identify the correct service/controller, and add tests.
`.trim();

  console.log(analysis);

  return {
    analysis,
  };
};

/*export const createPlan = async (state) => {
  console.log("\n--- CREATE PLAN ---");

  const prompt = `
    Task title:
    ${state.task.title}

    Task description:
    ${state.task.description}

    Create a implementation plan. Just provide  steps, do not include too much description.
    Do not write code yet.`;

    const response = await llm.chat.completions.create({
        model: process.env.LLM_MODEL,

        messages: [
        {
            role: "system",
            content:
            "You are a senior software engineer. Analyze the following software development task and create a practical implementation plan",
        },
        {
            role: "user",
            content: prompt,
        },
        ],
    });

  const plan = response.choices[0].message.content;

  console.log(plan);

  return {
    plan,
    planStatus: "pending",
  };
};*/

export const createPlan = async (state) => {
  console.log("\n--- CREATE PLAN ---");

  const plan = `
1. Find the existing customer report implementation.
2. Create a CSV export service.
3. Add an endpoint for CSV export.
4. Add authorization checks.
5. Add automated tests.
6. Update documentation.
`.trim();

  console.log(plan);

  return {
    plan,
    planStatus: "pending",
  };
};

export const checkPlan = async (state) => {
  console.log("\n--- CHECK PLAN ---");

  // For now, simulate approval.
  // Later this will come from Asana.
  const approved = true;

  if (approved) {
    console.log("Plan approved.");
  } else {
    console.log("Plan needs changes.");
  }

  return {
    planStatus: approved ? "approved" : "needs_work",
  };
};

/*export const routeAfterPlanCheck = (state) => {
  if (state.planStatus === "approved") {
    return "approved";
  }

  return "needs_work";
};*/

export const postPlanToAsana = async (state) => {
  console.log("\n--- POST PLAN TO ASANA ---");

  const comment = `
    AI Implementation Plan
    
    ${state.plan}

    ---

    AI Coding Status

    Please review this plan.
    Set the "AI Coding Status" custom field to:

    Plan Approved

    when the implementation plan is approved.

    Set it to:

    Plan Changes Requested

    if the plan needs changes.
    `.trim();

    await asana.addComment(
        state.task.id,
        comment
    );

    console.log("Plan posted to Asana.");

    return {
        workflowStatus: "waiting_for_approval",
    };
};

export const waitForApproval = async (state) => {
  console.log("\n--- WAITING FOR HUMAN APPROVAL ---");

  const approval = interrupt({
    type: "plan_approval",
    taskId: state.task.id,
    message: "Waiting for human approval of the implementation plan.",
  });

  console.log("Approval received:", approval);

  return {
    planStatus: "approved",
    workflowStatus: "approved",
  };
};

export const checkApproval = async (state) => {
  console.log("\n--- CHECK ASANA APPROVAL ---");

  if (!state.task.id) {
    throw new Error("Asana task ID is required");
  }

  const response = await asana.getTask(
    state.task.id
  );

  const task = mapAsanaTask(response);

  const status =
    task.workflowStatusField?.value ?? null;

  console.log(
    "Current AI Coding Status:",
    status ?? "NOT SET"
  );

  if (status === "Plan Approved") {
    return {
      planStatus: "approved",
      workflowStatus: "approved",
      task: {
        workflowStatus: status,
      },
    };
  }

  if (status === "Plan Changes Requested") {
    return {
      planStatus: "needs_work",
      workflowStatus: "planning",
      task: {
        workflowStatus: status,
      },
    };
  }

  return {
    planStatus: "pending",
    workflowStatus: "waiting_for_approval",
    task: {
      workflowStatus: status,
    },
  };
};

export const routeAfterApprovalCheck = (state) => {
  if (state.planStatus === "approved") {
    return "approved";
  }

  if (state.planStatus === "needs_work") {
    return "needs_work";
  }

  return "waiting";
};