import { SSTConfig } from "sst";
import { StorageStack } from "./stacks/StorageStack";
import { ApiStack } from "./stacks/ApiStack";
import { AuthStack } from "./stacks/AuthStack";
import { FrontendStack } from "./stacks/FrontendStack";
import { WebhookStack } from "./stacks/WebhookStack";

export default {
  config(_input) {
    return {
      name: "mox-rental-tools-vanilla",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app
    .stack(StorageStack)
    .stack(ApiStack)
    .stack(AuthStack)
    .stack(FrontendStack)
    .stack(WebhookStack);
    
    // Remove all resources when non-prod stages are removed
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
  }
} satisfies SSTConfig;
