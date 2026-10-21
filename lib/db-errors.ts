function getDatabaseError(error: unknown): { code?: unknown; name?: unknown } {
  let current = error;

  while (typeof current === "object" && current !== null) {
    if ("code" in current || "name" in current) {
      const metadata: { code?: unknown; name?: unknown } = {};
      if ("code" in current) metadata.code = current.code;
      if ("name" in current) metadata.name = current.name;

      if (metadata.code === "23505" || !("cause" in current)) {
        return metadata;
      }
    }

    if (!("cause" in current)) break;
    current = current.cause;
  }

  return {};
}

export function isUniqueViolation(error: unknown): boolean {
  return getDatabaseError(error).code === "23505";
}

export function logDatabaseError(context: string, error: unknown): void {
  const metadata = getDatabaseError(error);
  console.error(context, {
    name: typeof metadata.name === "string" ? metadata.name : "UnknownError",
    code: typeof metadata.code === "string" ? metadata.code : "unknown",
  });
}
