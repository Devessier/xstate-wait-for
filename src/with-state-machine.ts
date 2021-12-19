// @@@SNIPSTART with-state-machine
import {
  assign,
  createMachine,
  DoneInvokeEvent,
  interpret,
  StateFrom,
} from "xstate";

interface WaitForMachineContext<CallbackReturn> {
  expectReturn: CallbackReturn | undefined;
}

function createWaitForMachine<CallbackReturn>(timeout: number) {
  return createMachine<WaitForMachineContext<CallbackReturn>>(
    {
      context: {
        expectReturn: undefined as CallbackReturn | undefined,
      },

      after: {
        TIMEOUT: {
          target: "cancelled",
        },
      },

      initial: "tryExpect",

      states: {
        tryExpect: {
          initial: "assert",

          states: {
            assert: {
              invoke: {
                src: "expect",

                onDone: {
                  target: "succeeded",

                  actions: assign({
                    expectReturn: (
                      _,
                      { data }: DoneInvokeEvent<CallbackReturn>
                    ) => data,
                  }),
                },

                onError: {
                  target: "debouncing",
                },
              },
            },

            debouncing: {
              after: {
                10: {
                  target: "assert",
                },
              },
            },

            succeeded: {
              type: "final",
            },
          },

          onDone: {
            target: "succeeded",
          },

          on: {
            CANCELLED: {
              target: "cancelled",
            },
          },
        },

        succeeded: {
          type: "final",
        },

        cancelled: {
          type: "final",
        },
      },
    },
    {
      delays: {
        TIMEOUT: timeout,
      },
    }
  );
}

export function waitFor<CallbackReturn>(
  callback: () => CallbackReturn | Promise<CallbackReturn>,
  timeout: number
): Promise<CallbackReturn> {
  return new Promise((resolve, reject) => {
    let state: StateFrom<typeof createWaitForMachine>;

    interpret(
      createWaitForMachine(timeout).withConfig({
        services: {
          expect: async () => {
            return await callback();
          },
        },
      })
    )
      .onTransition((updatedState) => {
        state = updatedState;
      })
      .onDone(() => {
        if (state.matches("succeeded")) {
          resolve(state.context.expectReturn as CallbackReturn);

          return;
        }

        reject(new Error("Assertion timed out"));
      })
      .start();
  });
}
// @@@SNIPEND
