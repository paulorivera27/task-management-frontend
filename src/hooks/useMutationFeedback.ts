import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { errorMessageKey, translateServerMessage } from "../lib/errors";

interface Payload {
  errors: string[];
}

// Resolves true only when the request succeeded and the payload carries no validation errors.
export function useMutationFeedback() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<Payload | null | undefined>) => {
      setError(null);
      try {
        const payload = await action();
        if (payload && !payload.errors.length) return true;
        setError(
          payload?.errors.map((e) => translateServerMessage(e, t)).join(", ") ||
            t("errors.generic"),
        );
      } catch (err) {
        setError(t(errorMessageKey(err)));
      }
      return false;
    },
    [t],
  );

  return { error, run };
}
