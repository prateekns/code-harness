import "dotenv/config";
import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";
import { getProjectManagementProvider,} from "../integrations/pms/index.js";
import {WorkflowStatus,} from "../integrations/pms/status/workflow-status.js";


const providerName = process.env.PROJECT_MANAGEMENT_PROVIDER || "taiga";
const workItemId = process.argv[2];

console.log(typeof workItemId);

if (!workItemId) {
  console.error("Usage: node src/workflow/start.js <WORK_ITEM_ID>");
  process.exit(1);
}

const threadId = `${providerName}-${workItemId}`;

const config = {
  configurable: {
    thread_id: threadId,
  },
};


console.log("================================");
console.log("STARTING CODING WORKFLOW");
console.log( "================================");

console.log(`Provider: ${providerName}`);
console.log(`Work Item ID: ${workItemId}`);
console.log(`Thread ID: ${threadId}`);


try {
  await initializeGraph();

  /*
   * --------------------------------------------------
   * 1. Check whether a workflow state already exists
   * --------------------------------------------------
   */
  const existingState = await codingGraph.getState(config);

  const hasExistingState = Boolean(existingState?.values && Object.keys(existingState.values).length > 0);

  if (hasExistingState) {
    console.log("\n================================");
    console.log("WORKFLOW ALREADY EXISTS");
    console.log("================================\n");

    console.log(`A workflow already exists for ${providerName} work item ${workItemId}.`);

    console.log(`Thread ID: ${threadId}`);

    console.log("\nThe workflow was NOT started again.");

    console.log("Use resume.js to continue the existing workflow.");

    /*
     * Explicitly terminate the CLI process.
     */
    process.exit(0);
  }


  /*
   * --------------------------------------------------
   * 2. Fetch the current work item
   * --------------------------------------------------
   */

  const provider = getProjectManagementProvider(providerName);

  const workItem = await provider.getWorkItem(workItemId);

  console.log(`Current provider status: ${workItem.status.name }`);

  console.log(`Current workflow status: ${workItem.status.workflow ?? "UNMAPPED"}`);


  /*
   * --------------------------------------------------
   * 3. Only READY_FOR_PLANNING can start
   * --------------------------------------------------
   */

  if ( workItem.status.workflow !==WorkflowStatus.READY_FOR_PLANNING ) {
    throw new Error(
      [
        "The workflow cannot be started from the current status.",

        `Current workflow status: ${ workItem.status.workflow ?? "UNMAPPED" }`,

        `Current provider status: ${ workItem.status.name }`,

        `Required status: ${ WorkflowStatus.READY_FOR_PLANNING }`,
      ].join("\n")
    );
  }


  /*
   * --------------------------------------------------
   * 4. Start the NEW workflow
   * --------------------------------------------------
   */

  const result =
    await codingGraph.invoke(
      {
        provider: providerName,

        task: {
          id: Number(workItemId)
        },
      },

      config
    );


  console.log("\n================================");
  console.log("WORKFLOW STARTED");
  console.log("================================\n");

  console.log(JSON.stringify(result,null,2));

} catch (error) {
  console.error("\n================================");
  console.error("WORKFLOW START FAILED");
  console.error("================================\n");

  console.error(`Reason: ${error.message}`);
  console.error(`Code: ${error.code || "WORKFLOW_START_ERROR"}`);
  console.error( `Provider: ${ error.provider || providerName }`);
  console.error( `Retryable: ${ error.retryable ? "Yes" : "No" }`);

  if (error.statusCode) {
    console.error( `HTTP Status: ${ error.statusCode }`);
  }

  process.exitCode = 1;
}