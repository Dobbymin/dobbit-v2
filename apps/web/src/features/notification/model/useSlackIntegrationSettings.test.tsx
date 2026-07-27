// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSlackIntegrationSettings } from "./useSlackIntegrationSettings";

const mocks = vi.hoisted(() => ({
  integration: undefined,
  saveMutate: vi.fn(),
  savePending: false,
  testMutate: vi.fn(),
  testPending: false,
}));

vi.mock("./useNotifications", () => ({
  useSaveSlackIntegration: () => ({ isPending: mocks.savePending, mutate: mocks.saveMutate }),
  useSlackIntegration: () => ({ data: mocks.integration }),
  useTestSlackIntegration: () => ({ isPending: mocks.testPending, mutate: mocks.testMutate }),
}));

describe("useSlackIntegrationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.integration = undefined;
    mocks.savePending = false;
    mocks.testPending = false;
  });

  it("saves webhook, resets URL, and exposes save pending status", () => {
    mocks.savePending = true;
    const { result } = renderHook(() => useSlackIntegrationSettings());

    act(() => {
      result.current.changeWebhookUrl("https://hooks.slack.com/test");
      result.current.changeChannelName("alerts");
      result.current.changeEnabled(false);
    });
    act(() => {
      result.current.saveSlackIntegration();
    });

    expect(mocks.saveMutate).toHaveBeenCalledWith(
      { channelName: "alerts", enabled: false, webhookUrl: "https://hooks.slack.com/test" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    const callbacks = mocks.saveMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => callbacks.onSuccess());

    expect(result.current.webhookUrl).toBe("");
    expect(result.current.statusMessage).toBe("Slack Webhook이 저장되었습니다.");
    expect(result.current.isSavePending).toBe(true);
  });

  it("shows save failure", () => {
    const { result } = renderHook(() => useSlackIntegrationSettings());

    act(() => result.current.saveSlackIntegration());
    const callbacks = mocks.saveMutate.mock.calls[0]?.[1] as { onError: () => void };
    act(() => callbacks.onError());

    expect(result.current.statusMessage).toBe("Slack Webhook 저장에 실패했습니다.");
  });

  it("reports test success and failure results and exposes test pending status", () => {
    mocks.testPending = true;
    const { result } = renderHook(() => useSlackIntegrationSettings());

    act(() => result.current.testSlackIntegration());
    const successCallbacks = mocks.testMutate.mock.calls[0]?.[1] as {
      onSuccess: (result: { success: boolean }) => void;
    };
    act(() => successCallbacks.onSuccess({ success: true }));
    expect(result.current.statusMessage).toBe("테스트 메시지를 발송했습니다.");
    expect(result.current.isTestPending).toBe(true);

    act(() => result.current.testSlackIntegration());
    const failureCallbacks = mocks.testMutate.mock.calls[1]?.[1] as {
      onSuccess: (result: { success: boolean }) => void;
    };
    act(() => failureCallbacks.onSuccess({ success: false }));
    expect(result.current.statusMessage).toBe("테스트 메시지 발송에 실패했습니다.");
  });

  it("shows test mutation failure", () => {
    const { result } = renderHook(() => useSlackIntegrationSettings());

    act(() => result.current.testSlackIntegration());
    const callbacks = mocks.testMutate.mock.calls[0]?.[1] as { onError: () => void };
    act(() => callbacks.onError());

    expect(result.current.statusMessage).toBe("테스트 메시지 발송에 실패했습니다.");
  });
});
