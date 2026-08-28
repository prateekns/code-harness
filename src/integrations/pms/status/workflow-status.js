export const WorkflowStatus = Object.freeze({
  TODO: "TODO",

  READY_FOR_PLANNING:
    "READY_FOR_PLANNING",

  PLAN_READY:
    "PLAN_READY",

  PLAN_CHANGES_REQUESTED:
    "PLAN_CHANGES_REQUESTED",

  APPROVED_FOR_DEV:
    "APPROVED_FOR_DEV",

  CODING_IN_PROGRESS:
    "CODING_IN_PROGRESS",

  DONE:
    "DONE",
});

export const TaigaWorkflowStatusSlugs =
  Object.freeze({
    [WorkflowStatus.TODO]:
      "to-do",

    [WorkflowStatus.READY_FOR_PLANNING]:
      "ready-for-ns-code-factory",

    [WorkflowStatus.PLAN_READY]:
      "ready-for-review",

    [WorkflowStatus.PLAN_CHANGES_REQUESTED]:
      "plan-changes-requested",

    [WorkflowStatus.APPROVED_FOR_DEV]:
      "approved-for-dev",

    [WorkflowStatus.CODING_IN_PROGRESS]:
      "in-progress",

    [WorkflowStatus.DONE]:
      "done",
  });

export const TaigaSlugToWorkflowStatus =
  Object.freeze(
    Object.fromEntries(
      Object.entries(
        TaigaWorkflowStatusSlugs
      ).map(
        ([workflowStatus, slug]) => [
          slug,
          workflowStatus,
        ]
      )
    )
  );


/*export const WorkflowStatus = Object.freeze({
  TODO: "TODO",

  READY_FOR_PLANNING: "READY_FOR_PLANNING",

  PLAN_READY: "PLAN_READY",

  PLAN_CHANGES_REQUESTED: "PLAN_CHANGES_REQUESTED",

  APPROVED_FOR_DEV: "APPROVED_FOR_DEV",

  CODING_IN_PROGRESS: "CODING_IN_PROGRESS",

  DONE: "DONE",
});

export const TaigaWorkflowStatusSlugs = Object.freeze({
  [WorkflowStatus.TODO]: "to-do",

  [WorkflowStatus.READY_FOR_PLANNING]: "ready-for-ns-code-factory",

  [WorkflowStatus.PLAN_READY]: "ready-for-review",

  [WorkflowStatus.PLAN_CHANGES_REQUESTED]: "plan-changes-requested",

  [WorkflowStatus.APPROVED_FOR_DEV]: "approved-for-dev",

  [WorkflowStatus.CODING_IN_PROGRESS]: "in-progress",

  [WorkflowStatus.DONE]: "done",
});


export const TaigaSlugToWorkflowStatus =
  Object.freeze(
    Object.fromEntries(
      Object.entries(
        TaigaWorkflowStatusSlugs
      ).map(
        ([workflowStatus, slug]) => [
          slug,
          workflowStatus,
        ]
      )
    )
  );*/



/*export const WorkflowStatus = Object.freeze({
  TODO: "TODO",

  READY_FOR_PLANNING: "READY_FOR_PLANNING",

  PLAN_READY: "PLAN_READY",

  PLAN_CHANGES_REQUESTED: "PLAN_CHANGES_REQUESTED",

  APPROVED_FOR_DEV: "APPROVED_FOR_DEV",

  CODING_IN_PROGRESS: "CODING_IN_PROGRESS",

  DONE: "DONE",
});

export const TaigaWorkflowStatusNames = Object.freeze({
  [WorkflowStatus.TODO]: "To Do",

  [WorkflowStatus.READY_FOR_PLANNING]:
    "Ready For NS Code Factory",

  [WorkflowStatus.PLAN_READY]:
    "Ready For Review",

  [WorkflowStatus.PLAN_CHANGES_REQUESTED]:
    "Plan Changes Requested",

  [WorkflowStatus.APPROVED_FOR_DEV]:
    "Approved For Dev",

  [WorkflowStatus.CODING_IN_PROGRESS]:
    "In progress",

  [WorkflowStatus.DONE]:
    "Done",
});*/