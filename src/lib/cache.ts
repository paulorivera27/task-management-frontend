import type { ApolloCache } from "@apollo/client";

// Every cached page and filter is stale after a write; mounted queries refetch on their own.
export function invalidateTasks(cache: ApolloCache) {
  cache.evict({ fieldName: "tasks" });
  cache.gc();
}
