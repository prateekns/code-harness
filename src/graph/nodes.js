import {interrupt,} from "@langchain/langgraph";

import {getProjectManagementProvider,} from "../integrations/pms/index.js";

import {WorkflowStatus,} from "../integrations/pms/status/workflow-status.js";

import {findAIPlanComment,extractPlanFeedback,} from "../integrations/pms/feedback.js";

import {generateText,} from "../llm/index.js";


export const fetchTask = async (state) => {

  console.log("\n--- FETCH WORK ITEM ---");

  if (!state.task.id) {
    throw new Error(
      "Work item ID is required."
    );
  }

  const provider = getProjectManagementProvider(state.provider);

  const workItem  = await provider.getWorkItem(state.task.id);

  console.log(`Provider: ${state.provider}`);

  console.log(`Work Item: ${workItem.title}`);

  console.log(`Work Item Status: ${workItem.status.name}`);

  console.log(
  `Workflow Status: ${
    workItem.status.workflow ??
    "UNMAPPED"
  }`
);

  // console.log(`Type of Task Id ${typeof workItem.id}`)
  // console.log(`Type of Task Id ${typeof workItem.status.id}`)
  // console.log(`Type of Task Id ${typeof workItem.project.id}`)

  return {
    task: {
      id: workItem.id,
      reference: workItem.reference ?? null,
      title: workItem.title,
      description: workItem.description,
      status: {
        id: workItem.status.id,
        name: workItem.status.name,
        workflow: workItem.status.workflow ?? null,
      },

      project: {
        id: workItem.project.id,
        name: workItem.project.name,
      },
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

  const analysis =
    await generateText({
      system:
        "You are an experienced software engineer analyzing development tasks.",

      user:
        prompt,
    });

  console.log(
    analysis
  );

  return {
    analysis,
  };
};


export const createPlan = async (state) => {
  const nextVersion = state.planVersion + 1;

  console.log(
    `\n--- CREATE PLAN v${nextVersion} ---`
  );

  const isRevision =
    state.planVersion > 0 &&
    Boolean(
      state.planFeedback?.trim()
    );

  const prompt = `
    You are a senior software engineer.

    Create a practical implementation plan
    for the software development task below.

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
    This is a revision of an existing plan.

    The human reviewed the previous plan and
    requested changes.

    You MUST incorporate the human feedback.

    Do not blindly preserve parts of the old plan
    that conflict with the feedback.

    Produce a revised plan that directly addresses
    the requested changes.
    `
    : `
    This is the first implementation plan.

    Create the initial plan based on the task and
    technical analysis.
`
}

Include:

1. What needs to change.
2. Likely files/components involved.
3. Implementation steps.
4. Testing requirements.
5. Potential risks.

Do not write the actual implementation code.
`;

  /*const plan =
    await generateText({
      system: "You are an experienced software engineer creating implementation plans.",

      user:prompt,
    });

  console.log(plan);*/

    const plan = `
          1. Find the existing customer report implementation.
          2. Create a CSV export service.
          3. Add an endpoint for CSV export.
          4. Add authorization checks.
          5. Add automated tests.
          6. Update documentation.
          `.trim();

  return {
    plan,
    planVersion:nextVersion,
    planStatus:"pending",
  };
};


export const postPlanToWorkItem = async (state) => {
    console.log( "\n--- POST PLAN TO WORK ITEM ---");

    const provider = getProjectManagementProvider(state.provider);

    // const postedAt = new Date().toISOString();

    const comment = `
      [AI Coding Harness - Plan v${state.planVersion}]

      AI Implementation Plan

      ${state.plan}

      ---

      Please review this plan.

      Available decisions:

      ${WorkflowStatus.PLAN_CHANGES_REQUESTED}
      ${WorkflowStatus.APPROVED_FOR_DEV}

      The AI will not modify the repository until the work item reaches the coding authorization state.
      `.trim();

    /*
     * Step 1:
     * Create the AI plan comment.
     */
    await provider.addWorkItemComment(
      state.task.id,
      comment
    );


    /*
     * Step 2:
     * Read Taiga comments again.
     *
     * We need the actual history entry
     * ID created by Taiga.
     */
    const comments =
      await provider.getWorkItemComments(
        state.task.id
      );

          /*
     * Step 3:
     * Find the exact comment belonging
     * to this plan version.
     */
    const aiPlanComment =
      findAIPlanComment(
        comments,
        state.planVersion
      );

    if (!aiPlanComment) {
      throw new Error(
        [
          `Plan v${state.planVersion} was successfully submitted to the work item,`,
          "but the corresponding AI plan history entry could not be identified.",
          "",
          "The workflow has been stopped because human feedback cannot be safely associated with this plan.",
        ].join("\n")
      );
    }

    console.log(
      `[Workflow] AI plan history ID: ${aiPlanComment.id}`
    );

        /*
     * Timestamp retained for auditing only.
     */
    const planPostedAt =
      aiPlanComment.createdAt ||
      new Date().toISOString();

          /*
     * Step 4:
     * Move the User Story into the review
     * state.
     */
    const updatedWorkItem = await provider.updateWorkItemStatus(
      state.task.id,
      WorkflowStatus.PLAN_READY
    );

     console.log(
      `Plan v${state.planVersion} posted.`
    );

    return {
      /*
       * CRITICAL:
       *
       * This is persisted in LangGraph state
       * and therefore PostgreSQL.
       */
      planCommentId: aiPlanComment.id,
      planPostedAt: planPostedAt,

      workflowStatus: "waiting_for_plan_decision",

      task: {
        ...state.task,

        status: {
          id:
            updatedWorkItem.status.id,

          name:
            updatedWorkItem.status.name,

          workflow:
            updatedWorkItem.status.workflow,
        },
      },

      planStatus:
        "pending",
    };
  };


export const waitForPlanDecision =
  async (state) => {
    console.log(
      "\n--- WAITING FOR PLAN DECISION ---"
    );

    interrupt({
      type: "plan_decision",

      provider:
        state.provider,

      workItemId:
        state.task.id,

      planVersion:
        state.planVersion,

      planCommentId:
        state.planCommentId,

      message:
        `Waiting for human decision on plan v${state.planVersion}.`,
    });

    return {};
  };


export const checkPlanDecision = async (state) => {
    console.log( "\n--- CHECK PLAN DECISION ---");

    const provider = getProjectManagementProvider(state.provider);

    const workItem = await provider.getWorkItem(state.task.id);

    // const status = workItem.status.name;
    const workflowStatus = workItem.status.workflow;

     console.log(`Provider status: ${workItem.status.name}`);
     console.log(`Task Id: ${state.task.id}`);

        console.log(
      `Workflow status: ${
        workflowStatus ??
        "UNMAPPED"
      }`
    );

    if ( workflowStatus  === WorkflowStatus.PLAN_CHANGES_REQUESTED) {
      console.log( "Plan changes requested.");

            /*
       * We cannot safely identify feedback
       * without knowing which exact AI plan
       * the human is reviewing.
       */
      if (!state.planCommentId) {
        throw new Error(
          [
            "Plan Changes Requested, but the workflow does not have the history ID of the latest AI plan.",
            "",
            "Human feedback cannot be safely identified.",
            "The workflow has been stopped to prevent an older comment from being reused.",
          ].join("\n")
        );
      }

      const comments = await provider.getWorkItemComments( state.task.id);

      // console.log(comments);
      console.log(`Plan comment Id in State:${state.planCommentId}`);

      /*
       * Verify that the persisted AI plan
       * still exists in Taiga history.
       */
      const latestPlanComment =
        comments.find(
          (comment) => {
             console.log(`Plan comment Id:${comment.id}`);
            return comment.id === state.planCommentId
            }
        );

        console.log(latestPlanComment)

      if (!latestPlanComment) {
        throw new Error(
          [
            "The latest AI plan comment could not be found in Taiga history.",
            "",
            `Expected plan comment ID: ${state.planCommentId}`,
            `Plan version: ${state.planVersion}`,
            "",
            "Human feedback cannot be safely determined.",
            "The workflow has been stopped instead of guessing.",
          ].join("\n")
        );
      }


      console.log(
        `Latest AI plan: v${state.planVersion}`
      );

      console.log(
        `Latest AI plan history ID: ${state.planCommentId}`
      );


      /*
       * CRITICAL:
       *
       * Only comments AFTER the latest AI
       * plan are considered.
       */

      // const feedback = extractPlanFeedback(comments, state.planPostedAt);
      const feedback = extractPlanFeedback(comments, state.planCommentId);

      /*
       * No new human comments means:
       *
       * DO NOT CREATE A NEW PLAN.
       */
      if (!feedback.trim()) {
        throw new Error(
          [
            "Plan Changes Requested, but no new human feedback was found after the latest AI plan.",
            "",
            `Latest AI plan: v${state.planVersion}`,
            `AI plan history ID: ${state.planCommentId}`,
            "",
            "Please add a human comment describing the requested changes, then resume the workflow again.",
          ].join("\n")
        );
      }

      console.log("\n--- HUMAN PLAN FEEDBACK ---");

      console.log(feedback);

      return {
        planStatus:"needs_work",

        planFeedback:feedback,

        workflowStatus:"planning",

        task: {
          ...state.task,

          status: {
            id: workItem.status.id,

            name: workItem.status.name,

            workflow:
              workItem.status.workflow,
          },
        },
      };
    }

    if ( workflowStatus  ===  WorkflowStatus.APPROVED_FOR_DEV) {
      return {
        planStatus: "approved",

        workflowStatus: "waiting_for_coding",

        task: {
          ...state.task,

          status: {
            id: workItem.status.id,
            name: workItem.status.name,
             workflow:
              workItem.status.workflow,
          },
        },
      };
    }

    if ( workflowStatus  === WorkflowStatus.CODING_IN_PROGRESS) {
      return {
        planStatus: "approved",

        workflowStatus: "coding",

        task: {
          ...state.task,

          status: {
            id: workItem.status.id,

            name: workItem.status.name,

             workflow:
              workItem.status.workflow,
          },
        },
      };
    }

    return {
      planStatus: "pending",

      workflowStatus: "waiting_for_plan_decision",

      task: {
        ...state.task,

        status: {
          id: workItem.status.id,

          name: workItem.status.name,

           workflow:
              workItem.status.workflow,
        },
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

      provider:
        state.provider,

      workItemId:
        state.task.id,

      planVersion:
        state.planVersion,

      planCommentId:
        state.planCommentId,

      message:
        "Plan approved. Waiting for the work item to reach Approved For Dev.",
    });

    return {};
  };


export const checkCodingAuthorization =
  async (state) => {
    console.log(
      "\n--- CHECK CODING AUTHORIZATION ---"
    );

    const provider =
      getProjectManagementProvider(
        state.provider
      );

    const workItem =
      await provider.getWorkItem(
        state.task.id
      );

          const workflowStatus =
      workItem.status.workflow;

    const status =
      workItem.status.name;

    console.log(
      "Current status:",
      status
    );

        console.log(
      `Workflow status: ${
        workflowStatus ??
        "UNMAPPED"
      }`
    );

    if (
      workflowStatus  ===
      WorkflowStatus.CODING_IN_PROGRESS
    ) {
      return {
        workflowStatus:
          "coding",

        task: {
          ...state.task,

          status: {
            id:
              workItem.status.id,

            name:
              workItem.status.name,

               workflow:
              workItem.status.workflow,
          },
        },
      };
    }

    return {
      workflowStatus:
        "waiting_for_coding",

      task: {
        ...state.task,

        status: {
          id:
            workItem.status.id,

          name:
            workItem.status.name,

             workflow:
              workItem.status.workflow,
        },
      },
    };
  };


export const startCoding =
  async (state) => {
    console.log(
      "\n--- CODING WORKFLOW STARTED ---"
    );

    console.log(
      `Provider: ${state.provider}`
    );

    console.log(
      `Work Item: ${state.task.id}`
    );

    console.log(
      `Title: ${state.task.title}`
    );

    console.log(
      `Approved Plan Version: ${state.planVersion}`
    );

    /*
     * Actual repository/coding operations
     * will be implemented in Milestone 6.
     */

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