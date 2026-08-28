import {ProjectManagementProvider,} from "../provider.js";

import {mapTaigaUserStory,mapTaigaComments,} from "./mapper.js";

import {TaigaWorkflowStatusSlugs,TaigaSlugToWorkflowStatus,} from "../status/workflow-status.js";

export class TaigaProvider extends ProjectManagementProvider {

  HISTORY_PAGE_SIZE = 30;

  constructor(client) {
    super();
    this.client = client;
  }

  async getWorkItem(workItemId) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    const userStory = await this.client.request(`/userstories/${workItemId}`);

    const workItem = mapTaigaUserStory(userStory);

    const projectId = workItem.project.id;

    const taigaStatusId = workItem.status.id;

    console.log( `[Taiga] User Story status ID: ${taigaStatusId}`);
    console.log(`[Taiga] User Story project ID: ${projectId}`);

    const workflowStatus = await this.resolveWorkflowStatus(projectId,taigaStatusId);

    console.log(`[Taiga] Resolved workflow status: ${workflowStatus ?? "UNMAPPED"}`);

    return {
      ...workItem,

      status: {
        ...workItem.status,

        workflow: workflowStatus,
      },
    };
  }

  async getStatuses(projectId) {
    
    if ( projectId === null || projectId === undefined) {
      throw new Error(
        "Taiga project ID is required."
      );
    }

    const statuses = await this.client.request( `/userstory-statuses?project=${projectId}`);

    if (!Array.isArray(statuses)) {
      throw new Error(
        "Taiga user story status API returned an unexpected response."
      );
    }

    const lookupById = {};
    const lookupBySlug = {};

    for ( const status of statuses) {
      lookupById[String(status.id)] = status;

      lookupBySlug[status.slug] = status;
    }

    return {
      all: statuses,
      lookupById,
      lookupBySlug,
    };
  }

  /*async resolveWorkflowStatus(
    projectId,
    taigaStatusId
  ) {

    console.log(
    "[TaigaProvider] resolveWorkflowStatus() called"
  );

    if (
      projectId === null ||
      projectId === undefined
    ) {
      return null;
    }

    if (
      taigaStatusId === null ||
      taigaStatusId === undefined
    ) {
      return null;
    }

    const statuses =
      await this.getStatuses(
        projectId
      );

    const taigaStatus =
      statuses.lookupById[
        String(taigaStatusId)
      ];

    if (!taigaStatus) {
      console.warn(
        `[Taiga] Status ID ${taigaStatusId} was not found in project ${projectId}.`
      );

      console.warn(
        "[Taiga] Available statuses:"
      );

      for (
        const status of statuses.all
      ) {
        console.warn(
          `  ${status.id} | ${status.slug} | ${status.name}`
        );
      }

      return null;
    }

    console.log(
      `[Taiga] Matched status: ` +
      `${taigaStatus.id} | ` +
      `${taigaStatus.slug} | ` +
      `${taigaStatus.name}`
    );

    const workflowStatus =
      TaigaSlugToWorkflowStatus[
        taigaStatus.slug
      ];

    if (!workflowStatus) {
      console.warn(
        `[Taiga] Status slug "${taigaStatus.slug}" is not mapped to a WorkflowStatus.`
      );

      return null;
    }

    return workflowStatus;
  }*/

  async resolveWorkflowStatus(
  projectId,
  taigaStatusId
) {

  if (
    projectId === null ||
    projectId === undefined
  ) {
    return null;
  }

  if (
    taigaStatusId === null ||
    taigaStatusId === undefined
  ) {
    return null;
  }

  const statuses =
    await this.getStatuses(
      projectId
    );

  const taigaStatus =
    statuses.all.find(
      (status) =>
        String(status.id) ===
        String(taigaStatusId)
    );

  if (!taigaStatus) {
    console.warn(
      `[TaigaProvider] Status ${taigaStatusId} not found in project ${projectId}.`
    );

    return null;
  }


  const workflowStatus = TaigaSlugToWorkflowStatus[taigaStatus.slug];

  console.log(`[TaigaProvider] Workflow: ${workflowStatus ?? "UNMAPPED"}`);

  return workflowStatus ?? null;
}

  async resolveStatus(projectId, workflowStatus) {
    const statuses = await this.getStatuses(projectId);

    const taigaStatusSlug = TaigaWorkflowStatusSlugs[workflowStatus];

    if (!taigaStatusSlug) {
      throw new Error(
        `Unknown workflow status: ${workflowStatus}`
      );
    }

    const taigaStatus = statuses.lookupBySlug[taigaStatusSlug];

    if (!taigaStatus) {
      throw new Error(
        `Taiga status with slug "${taigaStatusSlug}" ` +
        `was not found in project ${projectId}.`
      );
    }

    return taigaStatus;
  }

  async resolveStatusId( projectId, workflowStatus) {
    const status = await this.resolveStatus( projectId, workflowStatus);
    return status.id;
  }

  async updateWorkItemStatus( workItemId, workflowStatus) {
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

    const userStory = await this.getWorkItem( workItemId);

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

    const status = await this.resolveStatus( projectId, workflowStatus);

    console.log( `[Taiga] Updating User Story ${workItemId}`);

    console.log(`[Taiga] Current workflow status: ${userStory.status.workflow ?? "UNKNOWN"}`);

    console.log(`[Taiga] New workflow status: ${workflowStatus}`);

    console.log(`[Taiga] New Taiga status: ${status.name}`);

    await this.client.request(
      `/userstories/${workItemId}`,
      {
        method: "PATCH",

        body: {
          status: status.id,
          version: userStory.version,
        },
      }
    );

    return this.getWorkItem(
      workItemId
    );
  }

  async getWorkItemHistory(workItemId, lastPage = 1) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    return this.client.request(
      `/history/userstory/${workItemId}?page=${lastPage}`,
      {
        returnHeader: true,
      }
    );
  }

  async getWorkItemComments(workItemId) {

    let history = await this.getWorkItemHistory(workItemId);
    const paginationCount = Number( history.headers.get("x-pagination-count") || 0);

    if(paginationCount > this.HISTORY_PAGE_SIZE) {
      const paginatedBy = Number( history.headers.get("x-paginated-by") || 0);
      const lastPage = Math.max(1,Math.ceil(paginationCount / paginatedBy));
      history = await this.getWorkItemHistory(workItemId, lastPage);
    }

    return mapTaigaComments(
      history.data
    );
  }

  async addWorkItemComment(workItemId, comment) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    if ( typeof comment !== "string" || !comment.trim()) {
      throw new Error(
        "Taiga User Story comment must be a non-empty string."
      );
    }

    const userStory = await this.getWorkItem(workItemId);

    if (userStory.version === undefined || userStory.version ===null) {
      throw new Error(
        `Taiga User Story ${workItemId} does not contain a version number.`
      );
    }

    console.log(`[Taiga] Adding comment to User Story ${workItemId}`);

    console.log(`[Taiga] Current version: ${userStory.version}`);

    await this.client.request(
      `/userstories/${workItemId}`,
      {
        method: "PATCH",

        body: {
          comment: comment.trim(),
          version: userStory.version,
        },
      }
    );

    return this.getWorkItem(
      workItemId
    );
  }
}




/*import {
  ProjectManagementProvider,
} from "../provider.js";

import {
  mapTaigaUserStory,
  mapTaigaComments,
} from "./mapper.js";

import {
  TaigaWorkflowStatusSlugs,
  TaigaSlugToWorkflowStatus,
} from "../status/workflow-status.js";


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

    const workItem =
      mapTaigaUserStory(
        userStory
      );

    const logicalStatus =
      await this.resolveWorkflowStatus(
        workItem.project.id,
        workItem.status.id
      );

    return {
      ...workItem,

      status: {
        ...workItem.status,

        workflow:
          logicalStatus,
      },
    };
  }


  async resolveWorkflowStatus(
    projectId,
    taigaStatusId
  ) {
    if (!projectId) {
      return null;
    }

    const statuses =
      await this.getStatuses(
        projectId
      );

    const taigaStatus =
      statuses.all.find(
        (status) =>
          status.id ===
          taigaStatusId
      );

    if (!taigaStatus) {
      return null;
    }

    return (
      TaigaSlugToWorkflowStatus[
        taigaStatus.slug
      ] ?? null
    );
  }


  async getStatuses(
    projectId
  ) {
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

    for (
      const status of statuses
    ) {
      lookup[status.slug] =
        status;
    }

    return {
      all: statuses,
      lookup,
    };
  }


  async resolveStatus(
    projectId,
    workflowStatus
  ) {
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

    return taigaStatus;
  }


  async resolveStatusId(
    projectId,
    workflowStatus
  ) {
    const status =
      await this.resolveStatus(
        projectId,
        workflowStatus
      );

    return status.id;
  }


  async updateWorkItemStatus(
    workItemId,
    workflowStatus
  ) {
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

    const userStory =
      await this.getWorkItem(
        workItemId
      );

    const projectId =
      userStory.project.id;

    if (!projectId) {
      throw new Error(
        `Unable to determine Taiga project for User Story ${workItemId}.`
      );
    }

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

    const status =
      await this.resolveStatus(
        projectId,
        workflowStatus
      );

    console.log(
      `[Taiga] Updating User Story ${workItemId}`
    );

    console.log(
      `[Taiga] Current version: ${userStory.version}`
    );

    console.log(
      `[Taiga] Current workflow status: ${
        userStory.status.workflow ??
        "UNKNOWN"
      }`
    );

    console.log(
      `[Taiga] New workflow status: ${workflowStatus}`
    );

    console.log(
      `[Taiga] New Taiga status: ${status.name}`
    );

    const updatedUserStory =
      await this.client.request(
        `/userstories/${workItemId}`,
        {
          method: "PATCH",

          body: {
            status:
              status.id,

            version:
              userStory.version,
          },
        }
      );

    const mapped =
      mapTaigaUserStory(
        updatedUserStory
      );

    return {
      ...mapped,

      status: {
        ...mapped.status,

        workflow:
          workflowStatus,
      },
    };
  }


  async getWorkItemHistory(
    workItemId
  ) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    return await this.client.request(
      `/history/userstory/${workItemId}`
    );
  }


  async getWorkItemComments(
    workItemId
  ) {
    const history =
      await this.getWorkItemHistory(
        workItemId
      );

    return mapTaigaComments(
      history
    );
  }


  async addWorkItemComment(
    workItemId,
    comment
  ) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    if (
      typeof comment !==
        "string" ||
      !comment.trim()
    ) {
      throw new Error(
        "Taiga User Story comment must be a non-empty string."
      );
    }

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

    const mapped =
      mapTaigaUserStory(
        updatedUserStory
      );

    return {
      ...mapped,

      status: {
        ...mapped.status,

        workflow:
          await this.resolveWorkflowStatus(
            mapped.project.id,
            mapped.status.id
          ),
      },
    };
  }
}*/




/*import {
  ProjectManagementProvider,
} from "../provider.js";

import {
  mapTaigaUserStory,
  mapTaigaComments,
} from "./mapper.js";

import {
  TaigaWorkflowStatusSlugs,
  TaigaSlugToWorkflowStatus,
} from "../status/workflow-status.js";

export class TaigaProvider extends ProjectManagementProvider {

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

  async getStatuses(
    projectId
  ) {
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

    for (
      const status of statuses
    ) {
      lookup[status.slug] =
        status;
    }

    return {
      all: statuses,
      lookup,
    };
  }

  async resolveStatus(
    projectId,
    workflowStatus
  ) {
    const statuses =
      await this.getStatuses(
        projectId
      );

    const slug =
      TaigaWorkflowStatusSlugs[
        workflowStatus
      ];

    if (!slug) {
      throw new Error(
        `Unknown workflow status: ${workflowStatus}`
      );
    }

    const status =
      statuses.lookup[slug];

    if (!status) {
      throw new Error(
        `Taiga status "${slug}" was not found in project ${projectId}.`
      );
    }

    return status;
  }

  async resolveStatusId(
    projectId,
    workflowStatus
  ) {
    const status =
      await this.resolveStatus(
        projectId,
        workflowStatus
      );

    return status.id;
  }

  async updateWorkItemStatus(
    workItemId,
    workflowStatus
  ) {
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

    const userStory =
      await this.getWorkItem(
        workItemId
      );

    const projectId =
      userStory.project.id;

    if (!projectId) {
      throw new Error(
        `Unable to determine Taiga project for User Story ${workItemId}.`
      );
    }

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

    const status =
      await this.resolveStatus(
        projectId,
        workflowStatus
      );

    console.log(
      `[Taiga] Updating User Story ${workItemId}`
    );

    console.log(
      `[Taiga] Current version: ${userStory.version}`
    );

    console.log(
      `[Taiga] New status: ${status.name}`
    );

    const updatedUserStory =
      await this.client.request(
        `/userstories/${workItemId}`,
        {
          method: "PATCH",

          body: {
            status:
              status.id,

            version:
              userStory.version,
          },
        }
      );

    return mapTaigaUserStory(
      updatedUserStory
    );
  }

  async getWorkItemHistory(
    workItemId
  ) {
    if (!workItemId) {
      throw new Error(
        "Taiga User Story ID is required."
      );
    }

    return await this.client.request(
      `/history/userstory/${workItemId}`
    );
  }

  async getWorkItemComments(
    workItemId
  ) {
    const history =
      await this.getWorkItemHistory(
        workItemId
      );

    return mapTaigaComments(
      history
    );
  }

  async addWorkItemComment(
    workItemId,
    comment
  ) {
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
}*/