import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "./send";

const originalFetch = global.fetch;

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.AUTH_FROM_EMAIL;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetchOk() {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 200 }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("sendEmail configuration", () => {
  it("returns not_configured when RESEND_API_KEY is missing", async () => {
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });

  it("returns not_configured when RESEND_API_KEY is whitespace-only", async () => {
    process.env.RESEND_API_KEY = "   ";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });

  it("returns not_configured when neither EMAIL_FROM nor AUTH_FROM_EMAIL is set", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });

  it("returns not_configured when both sender env vars are whitespace-only", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "   ";
    process.env.AUTH_FROM_EMAIL = "\t";
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
    });
    expect(result).toEqual({ sent: false, reason: "not_configured" });
  });
});

describe("sendEmail from resolution", () => {
  it("prefers EMAIL_FROM over AUTH_FROM_EMAIL", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    const fetchMock = mockFetchOk();

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.from).toBe("WardWise <hello@wardwise.ng>");
  });

  it("falls through to AUTH_FROM_EMAIL when EMAIL_FROM is whitespace-only", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "   ";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    const fetchMock = mockFetchOk();

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.from).toBe("WardWise <auth@wardwise.ng>");
  });

  it("uses input.from when provided, overriding both env vars", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    process.env.AUTH_FROM_EMAIL = "WardWise <auth@wardwise.ng>";
    const fetchMock = mockFetchOk();

    await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
      from: "Custom <custom@wardwise.ng>",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.from).toBe("Custom <custom@wardwise.ng>");
  });
});

describe("sendEmail request payload", () => {
  it("posts to Resend with Authorization header and minimal payload", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const fetchMock = mockFetchOk();

    const result = await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
    });

    expect(result).toEqual({ sent: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(["a@b.com"]);
    expect(body.subject).toBe("Hello");
    expect(body.html).toBe("<p>h</p>");
    expect(body.reply_to).toBeUndefined();
    expect(body.text).toBeUndefined();
  });

  it("includes reply_to when replyTo is provided", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const fetchMock = mockFetchOk();

    await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
      replyTo: "support@wardwise.ng",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.reply_to).toBe("support@wardwise.ng");
  });

  it("includes text when provided", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const fetchMock = mockFetchOk();

    await sendEmail({
      to: "a@b.com",
      subject: "Hello",
      html: "<p>h</p>",
      text: "plain body",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.text).toBe("plain body");
  });

  it("throws Error that includes both status and body snippet on non-OK response", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    global.fetch = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response("resend quota exceeded", { status: 429 })),
      ) as unknown as typeof fetch;

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 429.*resend quota exceeded/);
  });

  it("throws with status and no-body marker when body is empty", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    global.fetch = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response("", { status: 500 })),
      ) as unknown as typeof fetch;

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 500.*<no response body>/);
  });

  it("truncates very long error bodies with an ellipsis", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "WardWise <hello@wardwise.ng>";
    const longBody = "x".repeat(1200);
    global.fetch = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response(longBody, { status: 502 })),
      ) as unknown as typeof fetch;

    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/status 502.*x{500}…/);
  });
});
