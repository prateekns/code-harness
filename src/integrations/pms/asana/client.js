const ASANA_API_URL = "https://app.asana.com/api/1.0";

export class AsanaClient {
  constructor({ accessToken }) {
    if (!accessToken) {
      throw new Error("ASANA_ACCESS_TOKEN is not configured");
    }

    this.accessToken = accessToken;
  }

  async request(path, options = {}) {
    const response = await fetch(
      `${ASANA_API_URL}${path}`,
      {
        ...options,

        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Asana API error: ${response.status} ${response.statusText} - ${body}`
      );
    }

    return response.json();
  }

  async getTask(taskId) {
    return this.request(
      `/tasks/${taskId}?opt_fields=` +
        [
          "gid",
          "name",
          "notes",
          "completed",
          "assignee",
          "projects",
          "memberships",
          "custom_fields",
          "custom_fields.gid",
          "custom_fields.name",
          "custom_fields.type",
          "custom_fields.resource_subtype",
          "custom_fields.enum_value",
          "custom_fields.enum_value.gid",
          "custom_fields.enum_value.name",
          "custom_fields.enum_options",
          "custom_fields.enum_options.gid",
          "custom_fields.enum_options.name",
          "custom_fields.enum_options.enabled",
        ].join(",")
    );
  }

    async getTaskStories(taskId) {
    const stories = [];

    let offset = null;

    do {
      const query = new URLSearchParams({
        limit: "100",

        opt_fields: [
          "gid",
          "created_at",
          "created_by.gid",
          "created_by.name",
          "resource_subtype",
          "type",
          "text",
        ].join(","),
      });

      if (offset) {
        query.set("offset", offset);
      }

      const response =
        await this.request(
          `/tasks/${taskId}/stories?${query.toString()}`
        );

      stories.push(
        ...(response.data ?? [])
      );

      offset =
        response.next_page?.offset ??
        null;
    } while (offset);

    return stories;
  }

  async updateTaskCustomField(
    taskId,
    customFieldGid,
    enumOptionGid
  ) {
    return this.request(
      `/tasks/${taskId}`,
      {
        method: "PUT",

        body: JSON.stringify({
          data: {
            custom_fields: {
              [customFieldGid]: enumOptionGid,
            },
          },
        }),
      }
    );
  }

  async addComment(taskId, text) {
    return this.request(
      `/tasks/${taskId}/stories`,
      {
        method: "POST",

        body: JSON.stringify({
          data: {
            text,
          },
        }),
      }
    );
  }
}



/*const ASANA_API_URL = "https://app.asana.com/api/1.0";

export class AsanaClient {
  constructor({ accessToken }) {
    if (!accessToken) {
      throw new Error("ASANA_ACCESS_TOKEN is not configured");
    }

    this.accessToken = accessToken;
  }

  async request(path, options = {}) {
    const response = await fetch(
      `${ASANA_API_URL}${path}`,
      {
        ...options,

        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Asana API error: ${response.status} ${response.statusText} - ${body}`
      );
    }

    return response.json();
  }

  async getTask(taskId) {
    return this.request(
      `/tasks/${taskId}?opt_fields=gid,name,notes,completed,assignee,projects,memberships,custom_fields,custom_fields.gid,custom_fields.name,custom_fields.type,custom_fields.resource_subtype,custom_fields.enum_value,custom_fields.enum_value.gid,custom_fields.enum_value.name`
    );
  }

  async addComment(taskId, text) {
    return this.request(
      `/tasks/${taskId}/stories`,
      {
        method: "POST",

        body: JSON.stringify({
          data: {
            text,
          },
        }),
      }
    );
  }
}*/

/*const ASANA_API_URL = "https://app.asana.com/api/1.0";

export class AsanaClient {
    constructor({ accessToken }) {
        if (!accessToken) {
        throw new Error("ASANA_ACCESS_TOKEN is not configured");
        }

        this.accessToken = accessToken;
    }

    async request(path, options = {}) {
        const response = await fetch(
        `${ASANA_API_URL}${path}`,
        {
        ...options,

        headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
        }
        );

        if (!response.ok) {
        const body = await response.text();

        throw new Error(
        `Asana API error: ${response.status} ${response.statusText} - ${body}`
        );
        }

        return response.json();
    }

    async getTask(taskId) {
        return this.request(
        `/tasks/${taskId}?opt_fields=gid,name,notes,completed,assignee,projects,memberships`
        );
    }

    async addComment(taskId, text) {
        return this.request(
            `/tasks/${taskId}/stories`,
            {
            method: "POST",

            body: JSON.stringify({
                data: {
                text,
                },
            }),
            }
        );
    }

}*/