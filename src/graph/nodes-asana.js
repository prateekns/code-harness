import { interrupt } from "@langchain/langgraph";
import { asana } from "../integrations/pms/asana/index.js";

import {
  mapAsanaTask,
  getWorkflowStatusOption,
  extractPlanFeedback,
} from "../integrations/pms/asana/mapper.js";

// import { createLLM } from "../llm/index.js";
import { generateText } from "../llm/index.js";

// const llm = createLLM();


export const fetchTask = async (state) => {
  console.log(
    "\n--- FETCH ASANA TASK ---"
  );

  if (!state.task.id) {
    throw new Error(
      "Asana task ID is required"
    );
  }

  const response =
    await asana.getTask(
      state.task.id
    );

  const task =
    mapAsanaTask(response);

  console.log(
    "Task:",
    task.title
  );

  console.log(
    "AI Coding Status:",
    task.workflowStatusField
      ?.value ?? "NOT SET"
  );

  return {
    task: {
      id: task.id,
      title: task.title,
      description:
        task.description,
      status: task.status,
      workflowStatus:
        task.workflowStatusField
          ?.value ?? null,
    },
  };
};


export const analyzeTask = async (
  state
) => {
  console.log(
    "\n--- ANALYZE TASK ---"
  );

  const prompt = `
You are a senior software engineer.

Analyze this software development task.

Title:
${state.task.title}

Description:
${state.task.description}

Provide a concise technical analysis covering:

1. What the task requires.
2. Important technical considerations.
3. Areas of the codebase that may need investigation.
4. Testing considerations.

Do not write implementation code.
`;

  const response =
    await llm.chat.completions.create({
      model: process.env.LLM_MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an experienced software engineer analyzing development tasks.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],
    });

  const analysis =
    response.choices[0]
      .message.content;

  console.log(analysis);

  return {
    analysis,
  };
};


export const createPlan = async ( state ) => {
  console.log( `\n--- CREATE PLAN v${state.planVersion + 1} ---`);
  console.log(`Human Feedback: ${state.planFeedback}`)

  const isRevision = state.planVersion > 0 && Boolean( state.planFeedback?.trim());

  const prompt = `
    You are a senior software engineer. Create a practical implementation plan for the software development task below.

    TASK

    Title:
    ${state.task.title}

    Description:
    ${state.task.description}

    PREVIOUS PLAN

    ${
      state.plan ||
      "No previous plan exists."
    }

    HUMAN FEEDBACK

    ${
      state.planFeedback?.trim() ||
      "No human feedback has been provided."
    }

    INSTRUCTIONS

    ${
      isRevision
        ? `
    This is a revision of an existing plan.The human reviewed the previous plan and requested changes.
    You MUST incorporate the human feedback into the revised plan.
    Do not blindly preserve parts of the old plan that conflict with the feedback.
    Explain the updated approach clearly.
    `
        : `
    This is the first implementation plan. Create the initial plan based on the task and technical analysis.
    `
    }

    Do not write the actual implementation code.
    `;

  const response =
    await generateText({
        system:"You are an experienced software engineer creating implementation plans.",
        user: prompt,
    });

    // console.log(response);
    const plan = response;

  // const plan = response.choices[0].message.content;

       /*const plan = `
    1. Find the existing customer report implementation.
    2. Create a CSV export service.
    3. Add an endpoint for CSV export.
    4. Add authorization checks.
    5. Add automated tests.
    6. Update documentation.
    `.trim();*/

// console.log(state);

  const planVersion = state.planVersion + 1;

  console.log(`Generated plan version ${planVersion}.`);
  console.log(plan);

  return {
    plan,
    planVersion,
    planStatus: "pending",
  };
};


/*export const createPlan = async (state) => {
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
};*/


export const setAsanaWorkflowStatus =
  async (
    taskId,
    statusName
  ) => {
    const response =
      await asana.getTask(
        taskId
      );

    const task =
      mapAsanaTask(response);

    const {
      fieldGid,
      optionGid,
    } =
      getWorkflowStatusOption(
        task,
        statusName
      );

    await asana.updateTaskCustomField(
      taskId,
      fieldGid,
      optionGid
    );

    console.log(
      `Asana AI Coding Status → ${statusName}`
    );
  };


export const postPlanToAsana =
  async (state) => {
    console.log(
      "\n--- POST PLAN TO ASANA ---"
    );

    const postedAt =
      new Date().toISOString();

    const comment = `
[AI Coding Harness - Plan v${state.planVersion}]

AI Implementation Plan

${state.plan}

---

Please review this plan.

Available decisions:

Plan Approved
Plan Changes Requested
Coding

The AI will not modify the repository until the task is moved to "Coding".
`.trim();

    await asana.addComment(
      state.task.id,
      comment
    );

    await setAsanaWorkflowStatus(
      state.task.id,
      "Plan Ready"
    );

    console.log(
      `Plan v${state.planVersion} posted and status changed to Plan Ready.`
    );

    return {
      planPostedAt: postedAt,

      workflowStatus:
        "waiting_for_plan_decision",

      task: {
        ...state.task,

        workflowStatus:
          "Plan Ready",
      },

      planStatus: "pending",
    };
  };


export const waitForPlanDecision =
  async (state) => {
    console.log(
      "\n--- WAITING FOR PLAN DECISION ---"
    );

    interrupt({
      type: "plan_decision",

      taskId:
        state.task.id,

      planVersion:
        state.planVersion,

      message:
        `Waiting for human decision on plan v${state.planVersion}.`,
    });

    return {};
  };


export const checkPlanDecision =
  async (state) => {
    console.log(
      "\n--- CHECK PLAN DECISION ---"
    );

    const response =
      await asana.getTask(
        state.task.id
      );

    const task =
      mapAsanaTask(response);

    const status =
      task.workflowStatusField
        ?.value;

    console.log(
      "Current Asana status:",
      status
    );

    if (
      status ===
      "Plan Changes Requested"
    ) {
      console.log(
        "Plan changes requested. Reading human feedback..."
      );

      const stories =
        await asana.getTaskStories(
          state.task.id
        );

      const feedback =
        extractPlanFeedback(
          stories,
          state.planPostedAt
        );

      if (!feedback.trim()) {
        throw new Error(
          "Plan Changes Requested, but no human feedback was found after the latest plan."
        );
      }

      console.log(
        "\n--- HUMAN PLAN FEEDBACK ---"
      );

      console.log(feedback);

      return {
        planStatus:
          "needs_work",

        planFeedback:
          feedback,

        workflowStatus:
          "planning",

        task: {
          ...state.task,

          workflowStatus:
            status,
        },
      };
    }

    if (
      status ===
      "Plan Approved"
    ) {
      return {
        planStatus:
          "approved",

        workflowStatus:
          "waiting_for_coding",

        task: {
          ...state.task,

          workflowStatus:
            status,
        },
      };
    }

    if (
      status ===
      "Coding"
    ) {
      return {
        planStatus:
          "approved",

        workflowStatus:
          "coding",

        task: {
          ...state.task,

          workflowStatus:
            status,
        },
      };
    }

    return {
      planStatus:
        "pending",

      workflowStatus:
        "waiting_for_plan_decision",

      task: {
        ...state.task,

        workflowStatus:
          status ?? null,
      },
    };
  };


export const waitForCoding =
  async (state) => {
    console.log(
      "\n--- WAITING FOR CODING AUTHORIZATION ---"
    );

    interrupt({
      type:
        "coding_authorization",

      taskId:
        state.task.id,

      planVersion:
        state.planVersion,

      message:
        "Plan approved. Waiting for task status Coding.",
    });

    return {};
  };


export const checkCodingAuthorization =
  async (state) => {
    console.log(
      "\n--- CHECK CODING AUTHORIZATION ---"
    );

    const response =
      await asana.getTask(
        state.task.id
      );

    const task =
      mapAsanaTask(response);

    const status =
      task.workflowStatusField
        ?.value;

    console.log(
      "Current Asana status:",
      status
    );

    if (
      status === "Coding"
    ) {
      return {
        workflowStatus:
          "coding",

        task: {
          ...state.task,

          workflowStatus:
            status,
        },
      };
    }

    return {
      workflowStatus:
        "waiting_for_coding",

      task: {
        ...state.task,

        workflowStatus:
          status ?? null,
      },
    };
  };


export const startCoding =
  async (state) => {
    console.log(
      "\n--- CODING WORKFLOW STARTED ---"
    );

    console.log(
      "Task:",
      state.task.title
    );

    console.log(
      "Approved Plan Version:",
      state.planVersion
    );

    // Placeholder for Milestone 6.

    return {
      workflowStatus:
        "coding",
    };
  };


export const routeAfterPlanDecision =
  (state) => {
    if (
      state.planStatus ===
      "needs_work"
    ) {
      return "needs_work";
    }

    if (
      state.workflowStatus ===
      "waiting_for_coding"
    ) {
      return "plan_approved";
    }

    if (
      state.workflowStatus ===
      "coding"
    ) {
      return "coding";
    }

    return "waiting";
  };


export const routeAfterCodingCheck =
  (state) => {
    if (
      state.workflowStatus ===
      "coding"
    ) {
      return "coding";
    }

    return "waiting";
  };




/*import { interrupt } from "@langchain/langgraph";
import { createLLM } from "../llm/index.js";
import { asana } from "../integrations/asana/index.js";

import {
  mapAsanaTask,
  getWorkflowStatusOption,
} from "../integrations/asana/mapper.js";


const llm = createLLM();

export const fetchTask = async (state) => {
  console.log("\n--- FETCH ASANA TASK ---");

  if (!state.task.id) {
    throw new Error(
      "Asana task ID is required"
    );
  }

  const response = await asana.getTask(state.task.id);

  const task = mapAsanaTask(response);

  console.log( "Task:", task.title);

  console.log( "AI Coding Status:", task.workflowStatusField ?.value ?? "NOT SET");

  return {
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      workflowStatus: task.workflowStatusField ?.value ?? null,
    },
  };
};


export const analyzeTask = async (state) => {
  console.log("\n--- ANALYZE TASK ---");

  const prompt = `
    You are a senior software engineer.

    Analyze this software development task.

    Title:
    ${state.task.title}

    Description:
    ${state.task.description}

    Provide a concise technical analysis covering:

    1. What the task requires.
    2. Important technical considerations.
    3. Areas of the codebase that may need investigation.
    4. Testing considerations.

    Do not write implementation code.
    `;

  const response =
    await llm.chat.completions.create({
      model: process.env.LLM_MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an experienced software engineer analyzing development tasks.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],
    });

  const analysis =
    response.choices[0]
      .message.content;

  console.log(analysis);

  return {
    analysis,
  };
};


export const createPlan = async (state) => {
  console.log("\n--- CREATE PLAN ---");

  const prompt = `
    You are a senior software engineer.

    Create a practical implementation plan for this task.

    Task title:
    ${state.task.title}

    Task description:
    ${state.task.description}

    Technical analysis:
    ${state.analysis}

    Previous plan, if any:
    ${state.plan || "No previous plan exists."}

    Create a clear implementation plan.

    Include:

    1. What needs to change.
    2. Likely files/components involved.
    3. Implementation steps.
    4. Testing requirements.
    5. Potential risks.

    Do not write the actual code.
    `;

  const response =
    await llm.chat.completions.create({
      model: process.env.LLM_MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an experienced software engineer creating implementation plans.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],
    });

  const plan =
    response.choices[0]
      .message.content;

  console.log(plan);

  return {
    plan,
    planStatus: "pending",
  };
};

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


export const setAsanaWorkflowStatus = async (
  taskId,
  statusName
) => {
  const response =
    await asana.getTask(taskId);

  const task =
    mapAsanaTask(response);

  const {
    fieldGid,
    optionGid,
  } =
    getWorkflowStatusOption(
      task,
      statusName
    );

  await asana.updateTaskCustomField(
    taskId,
    fieldGid,
    optionGid
  );

  console.log(
    `Asana AI Coding Status → ${statusName}`
  );
};


export const postPlanToAsana = async (
  state
) => {
  console.log(
    "\n--- POST PLAN TO ASANA ---"
  );

  const comment = `
AI Implementation Plan

${state.plan}

---

Please review this plan.

Available decisions:

Plan Approved
Plan Changes Requested
Coding

The AI will not modify the repository until the task is moved to "Coding".
`.trim();

  await asana.addComment(
    state.task.id,
    comment
  );

  await setAsanaWorkflowStatus(
    state.task.id,
    "Plan Ready"
  );

  console.log(
    "Plan posted and status changed to Plan Ready."
  );

  return {
    workflowStatus:
      "waiting_for_plan_decision",

    task: {
      ...state.task,
      workflowStatus: "Plan Ready",
    },
  };
};


export const waitForPlanDecision = async (
  state
) => {
  console.log(
    "\n--- WAITING FOR PLAN DECISION ---"
  );

  interrupt({
    type: "plan_decision",
    taskId: state.task.id,
    message:
      "Waiting for human plan decision in Asana.",
  });

  return {};
};


export const checkPlanDecision = async (
  state
) => {
  console.log(
    "\n--- CHECK PLAN DECISION ---"
  );

  const response =
    await asana.getTask(
      state.task.id
    );

  const task =
    mapAsanaTask(response);

  const status =
    task.workflowStatusField?.value;

  console.log(
    "Current Asana status:",
    status
  );

  if (status === "Plan Changes Requested") {
    return {
      planStatus: "needs_work",

      workflowStatus:
        "planning",

      task: {
        ...state.task,
        workflowStatus: status,
      },
    };
  }

  if (status === "Plan Approved") {
    return {
      planStatus: "approved",

      workflowStatus:
        "waiting_for_coding",

      task: {
        ...state.task,
        workflowStatus: status,
      },
    };
  }

  if (status === "Coding") {
    return {
      planStatus: "approved",

      workflowStatus: "coding",

      task: {
        ...state.task,
        workflowStatus: status,
      },
    };
  }

  return {
    planStatus: "pending",

    workflowStatus:
      "waiting_for_plan_decision",

    task: {
      ...state.task,
      workflowStatus: status ?? null,
    },
  };
};


export const waitForCoding = async (
  state
) => {
  console.log(
    "\n--- WAITING FOR CODING AUTHORIZATION ---"
  );

  interrupt({
    type: "coding_authorization",
    taskId: state.task.id,
    message:
      "Plan approved. Waiting for task status Coding.",
  });

  return {};
};


export const checkCodingAuthorization = async (
  state
) => {
  console.log(
    "\n--- CHECK CODING AUTHORIZATION ---"
  );

  const response =
    await asana.getTask(
      state.task.id
    );

  const task =
    mapAsanaTask(response);

  const status =
    task.workflowStatusField?.value;

  console.log(
    "Current Asana status:",
    status
  );

  if (status === "Coding") {
    return {
      workflowStatus: "coding",

      task: {
        ...state.task,
        workflowStatus: status,
      },
    };
  }

  return {
    workflowStatus:
      "waiting_for_coding",

    task: {
      ...state.task,
      workflowStatus: status ?? null,
    },
  };
};


export const startCoding = async (
  state
) => {
  console.log(
    "\n--- CODING WORKFLOW STARTED ---"
  );

  console.log(
    "Task:",
    state.task.title
  );

  // Placeholder for Milestone 6.
  // We will replace this with:
  //
  // 1. Prepare repository
  // 2. Create branch
  // 3. Analyze codebase
  // 4. Write code
  // 5. Run tests
  //
  // For now we only prove that
  // the Coding state is correctly reached.

  return {
    workflowStatus: "coding",
  };
};


export const routeAfterPlanDecision = (
  state
) => {
  if (
    state.planStatus ===
    "needs_work"
  ) {
    return "needs_work";
  }

  if (
    state.workflowStatus ===
    "waiting_for_coding"
  ) {
    return "plan_approved";
  }

  if (
    state.workflowStatus ===
    "coding"
  ) {
    return "coding";
  }

  return "waiting";
};


export const routeAfterCodingCheck = (
  state
) => {
  if (
    state.workflowStatus ===
    "coding"
  ) {
    return "coding";
  }

  return "waiting";
};*/