export function extractPlanFeedback(
  comments,
  planPostedAt
) {
  if (!planPostedAt) {
    return "";
  }

  const cutoff =
    new Date(
      planPostedAt
    ).getTime();

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
}