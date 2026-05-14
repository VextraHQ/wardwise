const LOOPBACK_LABEL = "Localhost (this device)";

function unwrapAddress(value: string): string {
  return value.trim().replace(/^\[(.*)\]$/, "$1");
}

export function formatRequestIpLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const normalized = unwrapAddress(value);
  if (!normalized || normalized === "unknown") return null;

  const ipv4MappedMatch = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const candidate = ipv4MappedMatch?.[1] ?? normalized;

  if (
    candidate === "::1" ||
    candidate === "0:0:0:0:0:0:0:1" ||
    candidate === "127.0.0.1" ||
    candidate.toLowerCase() === "localhost"
  ) {
    return LOOPBACK_LABEL;
  }

  return candidate;
}
