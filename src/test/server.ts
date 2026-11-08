import { http } from "msw";
import { setupServer } from "msw/node";
import { REFRESH_URL } from "./urls";

// Default for tests that do not care about the session: no valid refresh token. Tests override it with mockRefresh.
export const server = setupServer(
  http.post(REFRESH_URL, () => new Response(null, { status: 401 })),
);
