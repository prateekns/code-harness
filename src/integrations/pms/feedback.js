const AI_PLAN_MARKER = "[AI Coding Harness - Plan";


export function isAIComment(comment) {
  
  if (!comment?.text) {
    return false;
  }

  return comment.text.includes(
    AI_PLAN_MARKER
  );
}


export function isHumanComment(comment) {
  return (
    Boolean(comment?.text?.trim()) &&
    !isAIComment(comment)
  );
}


export function extractPlanFeedback(
  comments,
  planPostedAt
) {
  if (!Array.isArray(comments)) {
    throw new Error(
      "Comments must be an array."
    );
  }

  if (!planPostedAt) {
    return "";
  }

  const cutoff =
    new Date(planPostedAt).getTime();

  if (Number.isNaN(cutoff)) {
    throw new Error(
      `Invalid planPostedAt timestamp: ${planPostedAt}`
    );
  }

  const feedback =
    comments
      .filter(isHumanComment)
      .filter(
        (comment) =>
          Boolean(comment.createdAt)
      )
      .filter((comment) => {
        const createdAt =
          new Date(
            comment.createdAt
          ).getTime();

        return (
          !Number.isNaN(createdAt) &&
          createdAt > cutoff
        );
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );

  return feedback
    .map(
      (comment) =>
        `${comment.authorName}: ${comment.text.trim()}`
    )
    .join("\n\n");
}


/*export function extractPlanFeedback(comments,planPostedAt) {
  if (!planPostedAt) {
    return "";
  }

  const cutoff = new Date(planPostedAt).getTime();

  const feedback =
    comments
      .filter(
        (comment) =>
          Boolean(
            comment.text?.trim()
          )
      )
      .filter(
        (comment) =>
          Boolean(
            comment.createdAt
          )
      )
      .filter(
        (comment) =>
          new Date(
            comment.createdAt
          ).getTime() >
          cutoff
      );

  return feedback
    .sort(
      (a, b) =>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    )
    .map(
      (comment) =>
        `${comment.authorName}: ${comment.text.trim()}`
    )
    .join("\n\n");
}*/