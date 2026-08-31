const AI_PLAN_MARKER =
  "[AI Coding Harness - Plan";


export function isAIComment(
  comment
) {
  if (!comment?.text) {
    return false;
  }

  return comment.text.includes(
    AI_PLAN_MARKER
  );
}


export function isHumanComment(
  comment
) {
  return (
    Boolean(
      comment?.text?.trim()
    ) &&
    !isAIComment(comment)
  );
}


/**
 * Find the exact AI plan comment
 * for a specific plan version.
 */
export function findAIPlanComment(
  comments,
  planVersion
) {
  if (!Array.isArray(comments)) {
    throw new Error(
      "Comments must be an array."
    );
  }

  const marker =
    `[AI Coding Harness - Plan v${planVersion}]`;

  const matches =
    comments.filter(
      (comment) =>
        comment?.text?.includes(
          marker
        )
    );

  if (!matches.length) {
    return null;
  }

  /*
   * There should normally be exactly
   * one comment for a plan version.
   *
   * If a retry created a duplicate,
   * select the latest one.
   */
  return matches
    .sort(
      (a, b) =>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    )
    .at(-1) ?? null;
}


/**
 * Return only comments created after
 * the exact AI plan comment.
 *
 * planCommentId is the authoritative
 * review boundary.
 */
export function getCommentsAfterPlan(
  comments,
  planCommentId
) {
  if (!Array.isArray(comments)) {
    throw new Error(
      "Comments must be an array."
    );
  }

  if (!planCommentId) {
    throw new Error(
      "Latest AI plan comment ID is required."
    );
  }

  /*
   * Taiga comments are normalized and
   * sorted chronologically by mapper.
   *
   * We use the stable comment ID to
   * establish the boundary.
   */
  const planIndex =
    comments.findIndex(
      (comment) =>
        comment.id === planCommentId
    );

  if (planIndex === -1) {
    throw new Error(
      "The latest AI plan comment could not be found in Taiga history ddds."
    );
  }

  return comments
    .slice(planIndex + 1)
    .filter(
      isHumanComment
    );
}


/**
 * Extract human feedback occurring
 * after the latest AI plan.
 */
export function extractPlanFeedback(
  comments,
  planCommentId
) {
  const feedbackComments =
    getCommentsAfterPlan(
      comments,
      planCommentId
    );

  return feedbackComments
    .map(
      (comment) =>
        `${comment.authorName}: ${comment.text.trim()}`
    )
    .join("\n\n");
}