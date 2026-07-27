// @vitest-environment jsdom
import type { AlertRule } from "@dobbit/shared";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNewsAlertSettings } from "./useNewsAlertSettings";

const mocks = vi.hoisted(() => ({
  alertRules: [] as AlertRule[],
  createMutate: vi.fn(),
  createPending: false,
  deleteMutate: vi.fn(),
  deletePending: false,
  deleteVariables: undefined as string | undefined,
  rulesError: false,
  rulesPending: false,
}));

vi.mock("./useAlertRules", () => ({
  useAlertRules: () => ({
    data: mocks.alertRules,
    isError: mocks.rulesError,
    isPending: mocks.rulesPending,
  }),
}));
vi.mock("./useCreateAlertRule", () => ({
  useCreateAlertRule: () => ({ isPending: mocks.createPending, mutate: mocks.createMutate }),
}));
vi.mock("./useDeleteAlertRule", () => ({
  useDeleteAlertRule: () => ({
    isPending: mocks.deletePending,
    mutate: mocks.deleteMutate,
    variables: mocks.deleteVariables,
  }),
}));

const newsRule: AlertRule = {
  comparison: "LTE",
  cooldownSeconds: 3600,
  enabled: true,
  id: "rule-1",
  lastTriggeredAt: null,
  marketCode: "KRW-BTC",
  sendInApp: true,
  sendSlack: false,
  threshold: -0.4,
  type: "NEWS_SENTIMENT",
};

describe("useNewsAlertSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.alertRules = [newsRule];
    mocks.createPending = false;
    mocks.deletePending = false;
    mocks.deleteVariables = undefined;
    mocks.rulesError = false;
    mocks.rulesPending = false;
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
  });

  it("submits valid alert and resets fields after create success", () => {
    const { result } = renderHook(() => useNewsAlertSettings());

    act(() => {
      result.current.changeMarketCode("btc");
      result.current.changeThreshold("0.7");
      result.current.changeSendSlack(true);
    });
    act(() => {
      result.current.submitNewsAlert();
    });

    expect(mocks.createMutate).toHaveBeenCalledWith(
      {
        comparison: "LTE",
        cooldownSeconds: 3600,
        marketCode: "KRW-BTC",
        sendInApp: true,
        sendSlack: true,
        threshold: -0.7,
        type: "NEWS_SENTIMENT",
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const callbacks = mocks.createMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => callbacks.onSuccess());

    expect(result.current.marketCode).toBe("");
    expect(result.current.threshold).toBe("0.4");
    expect(result.current.statusMessage).toBe("뉴스 감성 알림 규칙이 저장되었습니다.");
  });

  it("shows create failure and exposes rule and mutation status", () => {
    mocks.createPending = true;
    mocks.deletePending = true;
    mocks.deleteVariables = newsRule.id;
    mocks.rulesError = true;
    mocks.rulesPending = true;
    const { result } = renderHook(() => useNewsAlertSettings());

    act(() => {
      result.current.changeMarketCode("BTC");
    });
    act(() => {
      result.current.submitNewsAlert();
    });
    const callbacks = mocks.createMutate.mock.calls[0]?.[1] as { onError: () => void };
    act(() => callbacks.onError());

    expect(result.current.statusMessage).toBe("뉴스 감성 알림 규칙 저장에 실패했습니다.");
    expect(result.current.isCreatePending).toBe(true);
    expect(result.current.isDeletingRule(newsRule.id)).toBe(true);
    expect(result.current.isRulesError).toBe(true);
    expect(result.current.isRulesPending).toBe(true);
    expect(result.current.newsSentimentRules).toEqual([newsRule]);
  });

  it("updates status after delete success and failure", () => {
    const { result } = renderHook(() => useNewsAlertSettings());

    act(() => result.current.deleteNewsAlert(newsRule));
    const successCallbacks = mocks.deleteMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => successCallbacks.onSuccess());
    expect(result.current.statusMessage).toBe("뉴스 감성 알림 규칙이 삭제되었습니다.");

    act(() => result.current.deleteNewsAlert(newsRule));
    const errorCallbacks = mocks.deleteMutate.mock.calls[1]?.[1] as { onError: () => void };
    act(() => errorCallbacks.onError());
    expect(result.current.statusMessage).toBe("뉴스 감성 알림 규칙 삭제에 실패했습니다.");
  });

  it("does not mutate when delete confirmation is cancelled", () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    const { result } = renderHook(() => useNewsAlertSettings());

    act(() => result.current.deleteNewsAlert(newsRule));

    expect(window.confirm).toHaveBeenCalledWith("KRW-BTC 뉴스 감성 알림을 삭제할까요?");
    expect(mocks.deleteMutate).not.toHaveBeenCalled();
  });
});
