import { waitFor as waitForWithoutStateMachine } from "../src/without-state-machine";
import { waitFor as waitForWithStateMachine } from "../src/with-state-machine";

function alwaysThrowAnError() {
  throw new Error("Always throw an error");
}

async function testWithoutStateMachine() {
  try {
    await waitForWithoutStateMachine(alwaysThrowAnError, 1_000);

    console.error("An error was expected to be thrown");
  } catch (err) {
    console.error("Catched the error we expected", err);
  }

  try {
    let calls = 0;

    const result = await waitForWithoutStateMachine(() => {
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

async function testWithStateMachine() {
  try {
    await waitForWithStateMachine(alwaysThrowAnError, 1_000);

    console.error("An error was expected to be thrown");
  } catch (err) {
    console.error("Catched the error we expected", err);
  }

  try {
    let calls = 0;

    const result = await waitForWithStateMachine(() => {
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

async function test() {
  await testWithoutStateMachine();

  await testWithStateMachine();
}

test();
