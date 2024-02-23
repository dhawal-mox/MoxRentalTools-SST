import { ApiHandler } from "sst/node/api";
import { Todo } from "@mox-rental-tools-vanilla/core/todo";

export const create = ApiHandler(async (_evt) => {
  await Todo.create();

  return {
    statusCode: 200,
    body: "Todo created",
  };
});

export const list = ApiHandler(async (_evt) => {
  return {
    statusCode: 200,
    body: JSON.stringify(Todo.list()),
  };
});
