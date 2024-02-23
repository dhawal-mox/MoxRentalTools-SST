import { SSTConfig } from "sst";
import { StorageStack } from "./stacks/StorageStack";

export default {
  config(_input) {
    return {
      name: "mox-rental-tools-vanilla",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(StorageStack);
  }
} satisfies SSTConfig;
