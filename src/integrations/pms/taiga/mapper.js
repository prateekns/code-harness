export function mapTaigaUserStory(
  userStory
) {
  if (!userStory) {
    throw new Error(
      "Cannot map an empty Taiga User Story."
    );
  }

  return {
    id:
      userStory.id,

    reference:
      userStory.ref,

    title:
      userStory.subject || "",

    description:
      userStory.description || "",

    version:
      userStory.version,

    status: {
      id:
        userStory.status,

      name:
        userStory.status_extra_info?.name ||
        "",
    },

    project: {
      id:
        userStory.project,

      name:
        userStory.project_extra_info?.name ||
        "",
    },

    assignedTo:
      userStory.assigned_to,

    milestone:
      userStory.milestone,

    tags:
      userStory.tags || [],

    raw:
      userStory,
  };
}


export function mapTaigaHistoryEntry(
  historyEntry
) {
  if (!historyEntry) {
    throw new Error(
      "Cannot map an empty Taiga history entry."
    );
  }

  return {
    id:
      historyEntry.id,

    authorId:
      historyEntry.user?.pk ??
      null,

    authorName:
      historyEntry.user?.name ||
      historyEntry.user?.username ||
      "Unknown",

    text:
      historyEntry.comment || "",

    createdAt:
      historyEntry.created_at ||
      null,

    isHidden:
      historyEntry.is_hidden === true,

    deletedAt:
      historyEntry.delete_comment_date ||
      null,

    editedAt:
      historyEntry.edit_comment_date ||
      null,

    raw:
      historyEntry,
  };
}


export function mapTaigaComments(
  historyEntries
) {
  if (!Array.isArray(historyEntries)) {
    throw new Error(
      "Taiga history must be an array."
    );
  }

  return historyEntries
    .filter(
      (entry) =>
        Boolean(
          entry.comment?.trim()
        )
    )
    .filter(
      (entry) =>
        entry.is_hidden !== true &&
        !entry.delete_comment_date
    )
    .map(
      mapTaigaHistoryEntry
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    );
}