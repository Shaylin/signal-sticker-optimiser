import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const segmentationIntegration = process.env.SEGMENTATION_INTEGRATION === "1";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          exclude: ["**/*.browser.test.ts"]
        }
      },
      ...(segmentationIntegration
        ? [
            {
              test: {
                name: "browser",
                include: ["src/**/*.browser.test.ts"],
                globalSetup: ["./test/segmentationAssetServer.mjs"],
                env: {
                  SEGMENTATION_INTEGRATION: "1"
                },
                browser: {
                  enabled: true,
                  headless: true,
                  provider: playwright(),
                  instances: [{ browser: "chromium" as const }]
                }
              }
            }
          ]
        : [])
    ]
  }
});
