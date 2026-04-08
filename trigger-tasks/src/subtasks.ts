import { task } from "@trigger.dev/sdk";
import { square, multiply } from "./basic";

export const addSquares = task({
  id: "add_squares",
  run: async (payload: { a: number; b: number }) => {
    console.log(`Computing add_squares: ${payload.a}² + ${payload.b}²`);

    const result1 = await square.triggerAndWait({ a: payload.a }).unwrap();
    console.log(`First square result: ${result1}`);

    const result2 = await square.triggerAndWait({ a: payload.b }).unwrap();
    console.log(`Second square result: ${result2}`);

    const total = result1 + result2;
    console.log(`Total: ${total}`);
    return total;
  },
});

export const calculateArea = task({
  id: "calculate_area",
  run: async (payload: { length: number; width: number }) => {
    console.log(
      `Calculating area and perimeter for ${payload.length}x${payload.width}`
    );

    const area = await multiply
      .triggerAndWait({ a: payload.length, b: payload.width })
      .unwrap();
    console.log(`Area calculated: ${area}`);

    const perimeter = 2 * (payload.length + payload.width);
    console.log(`Perimeter: ${perimeter}`);

    return {
      area,
      perimeter,
      dimensions: { length: payload.length, width: payload.width },
    };
  },
});
