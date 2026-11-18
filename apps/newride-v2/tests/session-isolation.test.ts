import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL("../public/newridebis/index.html", import.meta.url),
  "utf8",
);
function extract(start: string, end: string) {
  return source.slice(
    source.indexOf(start),
    source.indexOf(end, source.indexOf(start) + start.length),
  );
}
test("une réponse d’amitié arrivée après un changement de compte ne remplit pas la session suivante", async () => {
  let resolve!: (v: unknown) => void;
  const response = new Promise((r) => (resolve = r));
  const state = {
    friends: [],
    friendRequestsReceived: [],
    friendRequestsSent: [],
    tab: "discover",
  };
  const context: any = {
    CURRENT_USER: { id: "A" },
    S: state,
    sbClient: { from: () => ({ select: () => ({ or: () => response }) }) },
    console,
    render: () => {
      throw Error("late render");
    },
  };
  vm.createContext(context);
  vm.runInContext(
    extract("async function loadFriendships(){", "let _friendSearchTimer"),
    context,
  );
  const task = context.loadFriendships();
  context.CURRENT_USER = { id: "B" };
  resolve({
    data: [
      {
        requester_id: "A",
        addressee_id: "C",
        status: "accepted",
        addressee: { id: "C", username: "Private friend" },
      },
    ],
    error: null,
  });
  await task;
  assert.equal(state.friends.length, 0);
  assert.equal(state.friendRequestsReceived.length, 0);
});
test("un fil chargé pour A n’apparaît pas dans B si l’authentification change pendant la requête", async () => {
  let resolve!: (v: unknown) => void;
  const response = new Promise((r) => (resolve = r));
  const state = { realPosts: [], tab: "discover" };
  const context: any = {
    CURRENT_USER: { id: "A" },
    S: state,
    sbClient: {
      from: () => ({
        select: () => ({
          eq: () => ({ order: () => ({ limit: () => response }) }),
        }),
      }),
    },
    console,
    render: () => {
      throw Error("late render");
    },
  };
  vm.createContext(context);
  vm.runInContext(
    extract(
      "async function loadRealPosts(sportId){",
      "async function loadRealSessions",
    ),
    context,
  );
  const task = context.loadRealPosts("equestre");
  context.CURRENT_USER = { id: "B" };
  resolve({
    data: [{ id: "private-A", user_id: "A", caption: "Private" }],
    error: null,
  });
  await task;
  assert.equal(state.realPosts.length, 0);
});
