import { http, HttpResponse } from "msw";
import { server } from "./server";
import type { Task } from "../types";

import { GRAPHQL_URL, REFRESH_URL, LOGOUT_URL } from "./urls";

export { API, GRAPHQL_URL, REFRESH_URL, LOGOUT_URL } from "./urls";

export const UNAUTHENTICATED = {
  data: null,
  errors: [
    {
      message: "Authentication required",
      extensions: { code: "UNAUTHENTICATED" },
    },
  ],
};

// Matches the REST endpoint: numeric user id.
export const sessionBody = (token = "fresh-token") => ({
  token,
  user: { id: 7, email: "user@example.com" },
});

export const task = (overrides: Partial<Task> = {}) => ({
  id: "1",
  title: "Write tests",
  description: "cover the auth link",
  status: "PENDING",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  __typename: "Task",
  ...overrides,
});

export interface GraphqlCall {
  operationName: string;
  variables: Record<string, unknown>;
  authorization: string | null;
}

type Resolver = (call: GraphqlCall) => unknown | Promise<unknown>;

// A resolver returns a JSON body, or a Response to control the status.
export function mockGraphql(resolvers: Record<string, Resolver>) {
  const calls: GraphqlCall[] = [];

  server.use(
    http.post(GRAPHQL_URL, async ({ request }) => {
      const body = (await request.json()) as {
        operationName: string;
        variables?: Record<string, unknown>;
      };
      const call: GraphqlCall = {
        operationName: body.operationName,
        variables: body.variables ?? {},
        authorization: request.headers.get("authorization"),
      };
      calls.push(call);

      const resolver = resolvers[call.operationName];
      if (!resolver) {
        return HttpResponse.json(
          { errors: [{ message: `unmocked ${call.operationName}` }] },
          { status: 500 },
        );
      }
      const out = await resolver(call);
      return out instanceof Response ? out : HttpResponse.json(out as object);
    }),
  );

  return calls;
}

export function mockRefresh(
  respond: () => Response | object | Promise<Response | object>,
) {
  const calls: number[] = [];
  server.use(
    http.post(REFRESH_URL, async () => {
      calls.push(Date.now());
      const out = await respond();
      return out instanceof Response ? out : HttpResponse.json(out);
    }),
  );
  return calls;
}

export function mockLogout(respond: () => Response) {
  const calls: number[] = [];
  server.use(
    http.delete(LOGOUT_URL, () => {
      calls.push(Date.now());
      return respond();
    }),
  );
  return calls;
}

export const status = (code: number, body: object | null = null) =>
  body === null ? new Response(null, { status: code }) : HttpResponse.json(body, { status: code });
