export class ProjectManagementProvider {
  async getWorkItem(workItemId) {
    throw new Error(
      "getWorkItem() must be implemented by the provider"
    );
  }

  async updateWorkItemStatus(
    workItemId,
    status
  ) {
    throw new Error(
      "updateWorkItemStatus() must be implemented by the provider"
    );
  }

  async addWorkItemComment(
    workItemId,
    comment
  ) {
    throw new Error(
      "addWorkItemComment() must be implemented by the provider"
    );
  }

  async getWorkItemComments(
    workItemId
  ) {
    throw new Error(
      "getWorkItemComments() must be implemented by the provider"
    );
  }

  async getStatuses(projectId) {
    throw new Error(
      "getStatuses() must be implemented by the provider"
    );
  }
}