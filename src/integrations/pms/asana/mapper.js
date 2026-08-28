export function mapAsanaTask(response) {
  const task = response.data;

  const customFields =
    task.custom_fields ?? [];

  const workflowStatusField =
    customFields.find(
      (field) =>
        field.name ===
        "AI Coding Status"
    );

  return {
    id: task.gid,

    title: task.name ?? "",

    description:
      task.notes ?? "",

    status: task.completed
      ? "completed"
      : "open",

    workflowStatusField:
      workflowStatusField
        ? {
            gid:
              workflowStatusField.gid,

            name:
              workflowStatusField.name,

            value:
              workflowStatusField
                .enum_value?.name ??
              null,

            valueGid:
              workflowStatusField
                .enum_value?.gid ??
              null,

            options: (
              workflowStatusField
                .enum_options ?? []
            ).map(
              (option) => ({
                gid: option.gid,
                name: option.name,
                enabled:
                  option.enabled,
              })
            ),
          }
        : null,
  };
}


export function getWorkflowStatusOption(
  task,
  statusName
) {
  const field =
    task.workflowStatusField;

  if (!field) {
    throw new Error(
      'Asana task does not contain the "AI Coding Status" custom field'
    );
  }

  const option =
    field.options.find(
      (item) =>
        item.name === statusName &&
        item.enabled !== false
    );

  if (!option) {
    throw new Error(
      `Asana AI Coding Status option "${statusName}" was not found`
    );
  }

  return {
    fieldGid: field.gid,
    optionGid: option.gid,
  };
}


const AI_PLAN_MARKER =
  "[AI Coding Harness - Plan";


export function extractPlanFeedback(
  stories,
  planPostedAt
) {
  if (!planPostedAt) {
    return "";
  }

  const cutoff =
    new Date(planPostedAt)
      .getTime();

  const feedbackStories =
    stories.filter(
      (story) => {
        if (
          story.resource_subtype !==
          "comment_added"
        ) {
          return false;
        }

        if (
          !story.text?.trim()
        ) {
          return false;
        }

        if (
          story.text.includes(
            AI_PLAN_MARKER
          )
        ) {
          return false;
        }

        if (!story.created_at) {
          return false;
        }

        const createdAt =
          new Date(
            story.created_at
          ).getTime();

        return createdAt > cutoff;
      }
    );

  return feedbackStories
    .sort(
      (a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
    )
    .map(
      (story) =>
        `${story.created_by?.name ?? "Human"}: ${story.text.trim()}`
    )
    .join("\n\n");
}




/*export function mapAsanaTask(response) {
  const task = response.data;

  const customFields = task.custom_fields ?? [];

  const workflowStatusField = customFields.find(
    (field) =>
      field.name === "AI Coding Status"
  );

  return {
    id: task.gid,

    title: task.name ?? "",

    description: task.notes ?? "",

    status: task.completed
      ? "completed"
      : "open",

    workflowStatusField:
      workflowStatusField
        ? {
            gid: workflowStatusField.gid,

            name: workflowStatusField.name,

            value:
              workflowStatusField
                .enum_value?.name ?? null,

            valueGid:
              workflowStatusField
                .enum_value?.gid ?? null,

            options:
              (
                workflowStatusField
                  .enum_options ?? []
              ).map((option) => ({
                gid: option.gid,
                name: option.name,
                enabled: option.enabled,
              })),
          }
        : null,
  };
}

export function getWorkflowStatusOption(
  task,
  statusName
) {
  const field =
    task.workflowStatusField;

  if (!field) {
    throw new Error(
      'Asana task does not contain the "AI Coding Status" custom field'
    );
  }

  const option = field.options.find(
    (item) =>
      item.name === statusName &&
      item.enabled !== false
  );

  if (!option) {
    throw new Error(
      `Asana AI Coding Status option "${statusName}" was not found`
    );
  }

  return {
    fieldGid: field.gid,
    optionGid: option.gid,
  };
}*/



/*export function mapAsanaTask(response) {
  const task = response.data;

  const customFields = task.custom_fields ?? [];

  const workflowStatusField = customFields.find(
    (field) => field.name === "AI Coding Status"
  );

  return {
    id: task.gid,
    title: task.name ?? "",
    description: task.notes ?? "",

    status: task.completed
      ? "completed"
      : "open",

    workflowStatusField: workflowStatusField
      ? {
          gid: workflowStatusField.gid,
          name: workflowStatusField.name,
          value:
            workflowStatusField.enum_value?.name ?? null,
          valueGid:
            workflowStatusField.enum_value?.gid ?? null,
        }
      : null,
  };
}*/



/*export function mapAsanaTask(response) {
  const task = response.data;

  return {
    id: task.gid,
    title: task.name ?? "",
    description: task.notes ?? "",
    status: task.completed ? "completed" : "open",
  };
}*/