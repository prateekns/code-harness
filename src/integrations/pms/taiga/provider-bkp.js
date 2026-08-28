import { ProjectManagementProvider,} from "../provider.js";

import { mapTaigaUserStory,mapTaigaComments,} from "./mapper.js";

import { TaigaWorkflowStatusSlugs, } from "../status/workflow-status.js";

export class TaigaProvider extends ProjectManagementProvider {

  constructor(client) {
    super();

    this.client = client;
  }

  async getWorkItem( workItemId) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    const userStory =
      await this.client.request(
        `/userstories/${workItemId}`
      );

    return mapTaigaUserStory(
      userStory
    );
  }

  async getStatuses(projectId) {
    if (!projectId) {
      throw new Error(
        "Taiga project ID is required."
      );
    }

    const statuses =
      await this.client.request(
        `/userstory-statuses?project=${projectId}`
      );

    const lookup = {};

    for (const status of statuses) {
      lookup[status.slug] = status;
    }

    return {
      all: statuses,
      lookup,
    };
  }

  async resolveStatusId(projectId,workflowStatus) {
    const statuses =
      await this.getStatuses(
        projectId
      );

    const taigaStatusSlug =
      TaigaWorkflowStatusSlugs[
        workflowStatus
      ];

    if (!taigaStatusSlug) {
      throw new Error(
        `Unknown workflow status: ${workflowStatus}`
      );
    }

    const taigaStatus =
      statuses.lookup[
        taigaStatusSlug
      ];

    if (!taigaStatus) {
      throw new Error(
        `Taiga status with slug "${taigaStatusSlug}" ` +
        `was not found in project ${projectId}.`
      );
    }

    return taigaStatus.id;
  }

  async updateWorkItemStatus(workItemId,workflowStatus) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    if (!workflowStatus) {
      throw new Error(
        "Workflow status is required."
      );
    }

      /*
     * IMPORTANT:
     * Fetch the latest User Story immediately
     * before attempting the update.
     *
     * This gives us the latest version number
     * required by Taiga OCC.
     */

    const userStory = await this.getWorkItem( workItemId );

    const projectId = userStory.project.id;

    if (!projectId) {
      throw new Error(
        `Unable to determine Taiga project for User Story ${workItemId}.`
      );
    }

    if ( userStory.version === undefined || userStory.version === null) {
      throw new Error(
        `Taiga User Story ${workItemId} does not contain a version number.`
      );
    }

    const statusId = await this.resolveStatusId(projectId, workflowStatus);

    console.log(`[Taiga] Updating User Story ${workItemId}`);

    console.log(`[Taiga] Current version: ${userStory.version}`);

    console.log(`[Taiga] New status ID: ${statusId}`);

    const updatedUserStory =
      await this.client.request(
        `/userstories/${workItemId}`,
        {
          method: "PATCH",

          body: {
            status: statusId,
            version: userStory.version,
          },
        }
      );

    return mapTaigaUserStory(
      updatedUserStory
    );
  }

  async getWorkItemHistory(workItemId) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    return await this.client.request(
      `/history/userstory/${workItemId}`
    );
  }

  async addWorkItemComment(workItemId,comment) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    if (
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      throw new Error(
        "Taiga User Story comment must be a non-empty string."
      );
    }

    /*
     * Fetch the latest User Story first.
     *
     * We need the current version because
     * Taiga uses optimistic concurrency control.
     */
    const userStory =
      await this.getWorkItem(
        workItemId
      );

    if (
      userStory.version ===
      undefined ||
      userStory.version ===
      null
    ) {
      throw new Error(
        `Taiga User Story ${workItemId} does not contain a version number.`
      );
    }

    console.log(
      `[Taiga] Adding comment to User Story ${workItemId}`
    );

    console.log(
      `[Taiga] Current version: ${userStory.version}`
    );

    const updatedUserStory =
      await this.client.request(
        `/userstories/${workItemId}`,
        {
          method: "PATCH",

          body: {
            comment:
              comment.trim(),

            version:
              userStory.version,
          },
        }
      );

    return mapTaigaUserStory(
      updatedUserStory
    );
  }

  async getWorkItemComments(workItemId) {
    const history =
      await this.getWorkItemHistory(
        workItemId
      );

    return mapTaigaComments(
      history
    );
  }
}



/*import { ProjectManagementProvider,} from "../provider.js";
import { WorkflowStatus, TaigaWorkflowStatusNames } from "../status/workflow-status.js";

import {
  mapTaigaUserStory,
} from "./mapper.js";

export class TaigaProvider
  extends ProjectManagementProvider {

  constructor(client) {
    super();

    this.client = client;
  }

  async getWorkItem(
    workItemId
  ) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    const userStory =
      await this.client.request(
        `/userstories/${workItemId}`
      );

    return mapTaigaUserStory(
      userStory
    );
  }

  async getStatuses(projectId) {
  if (!projectId) {
    throw new Error("Taiga project ID is required.");
  }

  const statuses = await this.client.request(
    `/userstory-statuses?project=${projectId}`
  );

  const lookup = {};

  for (const status of statuses) {
    lookup[status.name] = status;
  }

  return {
    all: statuses,
    lookup,
  };
}

  async getStatuses(
    projectId
  ) {
    if (!projectId) {
      throw new Error(
        "Taiga project ID is required."
      );
    }

    return await this.client.request(
      `/userstory-statuses?project=${projectId}`
    );
  }

  async updateWorkItemStatus(
    workItemId,
    status
  ) {
    throw new Error(
      "updateWorkItemStatus() will be implemented in Milestone 5E-T-5."
    );
  }

  async addWorkItemComment(
    workItemId,
    comment
  ) {
    throw new Error(
      "addWorkItemComment() will be implemented in Milestone 5E-T-6."
    );
  }

  async getWorkItemComments(
    workItemId
  ) {
    throw new Error(
      "getWorkItemComments() will be implemented in Milestone 5E-T-6."
    );
  }

async resolveStatusId(projectId, workflowStatus) {
  const statuses = await this.getStatuses(projectId);

  const taigaStatusName =
    TaigaWorkflowStatusNames[workflowStatus];

  if (!taigaStatusName) {
    throw new Error(
      `Unknown workflow status: ${workflowStatus}`
    );
  }

  const taigaStatus =
    statuses.lookup[taigaStatusName];

  if (!taigaStatus) {
    throw new Error(
      `Taiga status "${taigaStatusName}" not found in project ${projectId}`
    );
  }

  return taigaStatus.id;
}
  
}*/