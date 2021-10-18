import { waitFor } from "../src/without-state-machine";

function alwaysThrowAnError() {
  throw new Error("Always throw an error");
}

async function test() {
  try {
    await waitFor(alwaysThrowAnError, 1_000);

    console.error("An error was expected to be thrown");
  } catch (err) {
    console.error("Catched the error we expected", err);
  }

  try {
    let calls = 0;

    const result = await waitFor(() => {
      if (calls > 10) {
        return "I'm fine";
      }

      calls++;

      throw new Error("Not fine yet");
    }, 1_000);

    console.log("Received result:", result);
  } catch (err) {
    console.error("No error was expected", err);
  }
}

test();
