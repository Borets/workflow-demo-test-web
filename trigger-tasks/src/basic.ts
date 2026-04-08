import { task } from "@trigger.dev/sdk/v3";

export const square = task({
  id: "square",
  run: async (payload: { a: number }) => {
    console.log(`Computing square of ${payload.a}`);
    return payload.a * payload.a;
  },
});

export const cube = task({
  id: "cube",
  run: async (payload: { a: number }) => {
    console.log(`Computing cube of ${payload.a}`);
    return payload.a * payload.a * payload.a;
  },
});

export const addNumbers = task({
  id: "add_with_retry",
  retry: { maxAttempts: 3, minTimeoutInMs: 1000, factor: 2 },
  run: async (payload: { a: number; b: number }) => {
    console.log(`Adding ${payload.a} + ${payload.b}`);
    return payload.a + payload.b;
  },
});

export const greet = task({
  id: "greet",
  run: async (payload: { name: string }) => {
    console.log(`Greeting ${payload.name}`);
    return `Hello, ${payload.name}! Welcome to Render Workflows.`;
  },
});

export const multiply = task({
  id: "multiply",
  run: async (payload: { a: number; b: number }) => {
    console.log(`Multiplying ${payload.a} * ${payload.b}`);
    return payload.a * payload.b;
  },
});
