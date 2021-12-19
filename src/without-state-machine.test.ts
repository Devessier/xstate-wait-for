import it from "japa";
import { waitFor } from "./without-state-machine.js";

function alwaysThrowAnError() {
  throw new Error("Always throw an error");
}

it.group("Without state machine", () => {
  it("fails when callback function always fails", async (assert) => {
    assert.plan(1);

    try {
      await waitFor(alwaysThrowAnError, 1_000);
    } catch (err) {
      assert.instanceOf(err, Error);
    }
  });

  it("returns valid result after several tries", async (assert) => {
    let calls = 0;

    const result = await waitFor(() => {
      if (calls > 10) {
        return "I'm fine";
      }

      calls++;

      throw new Error("Not fine yet");
    }, 1_000);

    assert.equal(result, "I'm fine");
  });
});
