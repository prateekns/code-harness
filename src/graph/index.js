import {
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

import { CodingTaskState } from "./state.js";

import {
  fetchTask,
  analyzeTask,
  createPlan,
  postPlanToWorkItem,
  waitForPlanDecision,
  checkPlanDecision,
  waitForCoding,
  checkCodingAuthorization,
  startCoding,
  routeAfterPlanDecision,
  routeAfterCodingCheck,
} from "./nodes.js";

import { getPostgresConnectionString } from "../config/database.js";


const graph = new StateGraph(CodingTaskState)
  .addNode("fetchTask", fetchTask)
//   .addNode("analyzeTask",analyzeTask)
  .addNode("createPlan",createPlan)
  .addNode("postPlanToWorkItem",postPlanToWorkItem)
  .addNode("waitForPlanDecision",waitForPlanDecision)
  .addNode("checkPlanDecision",checkPlanDecision)
  .addNode("waitForCoding",waitForCoding)
  .addNode("checkCodingAuthorization",checkCodingAuthorization)
  .addNode("startCoding",startCoding)

  .addEdge(START,"fetchTask")
  .addEdge("fetchTask","createPlan")
//   .addEdge("fetchTask","analyzeTask")
//   .addEdge("analyzeTask","createPlan")
  .addEdge("createPlan","postPlanToWorkItem")
  .addEdge("postPlanToWorkItem","waitForPlanDecision")
  .addEdge("waitForPlanDecision","checkPlanDecision")

  .addConditionalEdges(
    "checkPlanDecision",
    routeAfterPlanDecision,
    {
      needs_work: "createPlan",
      plan_approved: "waitForCoding",
      coding: "startCoding",
      waiting: "waitForPlanDecision",
    }
  )

  .addEdge("waitForCoding","checkCodingAuthorization")

  .addConditionalEdges(
    "checkCodingAuthorization",
    routeAfterCodingCheck,
    {
      coding: "startCoding",
      waiting: "waitForCoding",
    }
  )

  .addEdge("startCoding",END);


const connectionString = getPostgresConnectionString();


export const checkpointer = PostgresSaver.fromConnString( connectionString);
// const checkpointer = new MemorySaver();

export const codingGraph = graph.compile({ checkpointer,});



/*import {
  StateGraph,
  MemorySaver,
  START,
  END,
} from "@langchain/langgraph";

import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

import { CodingTaskState } from "./state.js";

import {
  fetchTask,
  analyzeTask,
  createPlan,
  postPlanToAsana,
  waitForApproval,
  checkApproval,
  routeAfterApprovalCheck,
} from "./nodes_bkp.js";

import { getPostgresConnectionString } from "../config/database.js";

const graph = new StateGraph(CodingTaskState)
  .addNode("fetchTask", fetchTask)
  .addNode("analyzeTask", analyzeTask)
  .addNode("createPlan", createPlan)
  .addNode("postPlanToAsana", postPlanToAsana)
  .addNode("waitForApproval", waitForApproval)
  .addNode("checkApproval", checkApproval)

  .addEdge(START, "fetchTask")
  .addEdge("fetchTask", "analyzeTask")
  .addEdge("analyzeTask", "createPlan")
  .addEdge("createPlan", "postPlanToAsana")
  .addEdge("postPlanToAsana", "waitForApproval")
  .addEdge("waitForApproval", "checkApproval")

  .addConditionalEdges(
  "checkApproval",
  routeAfterApprovalCheck,
  {
    approved: END,
    needs_work: "createPlan",
    waiting: "waitForApproval",
  }
);

const connectionString = getPostgresConnectionString();

// const checkpointer = new MemorySaver();
// const checkpointer = new PostgresSaver();
export const checkpointer = PostgresSaver.fromConnString(connectionString);

export const codingGraph = graph.compile({
    checkpointer,
});*/