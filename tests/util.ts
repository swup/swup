import { Request, expect } from "@playwright/test"

export function expectHeaders(
  request: Request,
  expected: Record<string, string>
): boolean {
  const headers = request.headers();
  Object.entries(expected).forEach(([header, value]) => {
    expect(headers).toHaveProperty(header.toLowerCase(), value);
  });
  return true;
}
