"use client";

import { FormEvent, useMemo, useState } from "react";

import type { AlertRule } from "@dobbit/shared";
import { Skeleton } from "@/shared";

import { useAlertRules, useCreateAlertRule, useDeleteAlertRule } from "../model";

type Direction = "UP" | "DOWN";

const DEFAULT_COOLDOWN_SECONDS = 3_600;

const normalizeMarketCode = (value: string) => {
  const marketCode = value.trim().toUpperCase();
  return marketCode.startsWith("KRW-") ? marketCode : `KRW-${marketCode}`;
};

const getRuleDirection = (rule: AlertRule): Direction => {
  if (rule.comparison === "LTE" || rule.threshold < 0) {
    return "DOWN";
  }

  return "UP";
};

export function NewsAlertSettings() {
  const [marketCode, setMarketCode] = useState("");
  const [direction, setDirection] = useState<Direction>("DOWN");
  const [threshold, setThreshold] = useState("0.4");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendSlack, setSendSlack] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const alertRulesQuery = useAlertRules();
  const createMutation = useCreateAlertRule();
  const deleteMutation = useDeleteAlertRule();

  const newsSentimentRules = useMemo(() => {
    return alertRulesQuery.data?.filter((rule) => rule.type === "NEWS_SENTIMENT") ?? [];
  }, [alertRulesQuery.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const normalizedMarketCode = normalizeMarketCode(marketCode);
    const absoluteThreshold = Math.abs(Number(threshold));

    if (!normalizedMarketCode || normalizedMarketCode === "KRW-" || Number.isNaN(absoluteThreshold)) {
      setStatusMessage("마켓 코드와 기준값을 확인해주세요.");
      return;
    }

    createMutation.mutate(
      {
        marketCode: normalizedMarketCode,
        type: "NEWS_SENTIMENT",
        comparison: direction === "UP" ? "GTE" : "LTE",
        threshold: direction === "UP" ? absoluteThreshold : -absoluteThreshold,
        sendInApp,
        sendSlack,
        cooldownSeconds: DEFAULT_COOLDOWN_SECONDS,
      },
      {
        onSuccess: () => {
          setMarketCode("");
          setThreshold("0.4");
          setStatusMessage("뉴스 감성 알림 규칙이 저장되었습니다.");
        },
        onError: () => setStatusMessage("뉴스 감성 알림 규칙 저장에 실패했습니다."),
      },
    );
  };

  const handleDelete = (rule: AlertRule) => {
    if (!window.confirm(`${rule.marketCode} 뉴스 감성 알림을 삭제할까요?`)) {
      return;
    }

    setStatusMessage(null);
    deleteMutation.mutate(rule.id, {
      onSuccess: () => setStatusMessage("뉴스 감성 알림 규칙이 삭제되었습니다."),
      onError: () => setStatusMessage("뉴스 감성 알림 규칙 삭제에 실패했습니다."),
    });
  };

  return (
    <section className='border-t border-white/10 pt-5'>
      <div>
        <h2 className='text-base font-semibold text-text-dark'>뉴스 감성 알림</h2>
        <p className='mt-1 text-sm text-text-muted-dark'>뉴스 감성 점수가 기준을 넘으면 알림을 받습니다.</p>
      </div>

      <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
        <div className='grid gap-3 md:grid-cols-[1fr_120px_120px]'>
          <input
            type='text'
            value={marketCode}
            onChange={(event) => setMarketCode(event.target.value)}
            placeholder='BTC 또는 KRW-BTC'
            className='min-w-0 rounded-md border border-white/10 px-3 py-2 text-sm text-text-dark placeholder:text-text-muted-dark outline-none focus:border-primary bg-transparent'
          />
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value as Direction)}
            className='min-w-0 rounded-md border border-white/10 px-3 py-2 text-sm text-text-dark outline-none focus:border-primary bg-transparent [&>option]:bg-surface-dark'
          >
            <option value='UP'>상승</option>
            <option value='DOWN'>하락</option>
          </select>
          <input
            type='number'
            min='-1'
            max='1'
            step='0.01'
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            className='min-w-0 rounded-md border border-white/10 px-3 py-2 text-sm text-text-dark placeholder:text-text-muted-dark outline-none focus:border-primary bg-transparent'
          />
        </div>

        <div className='flex flex-wrap items-center gap-4 text-sm text-text-dark'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={sendInApp}
              onChange={(event) => setSendInApp(event.target.checked)}
              className='h-4 w-4'
            />
            앱 알림
          </label>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={sendSlack}
              onChange={(event) => setSendSlack(event.target.checked)}
              className='h-4 w-4'
            />
            Slack
          </label>
        </div>

        <button
          type='submit'
          disabled={!marketCode.trim() || createMutation.isPending}
          className='rounded-md bg-primary px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:bg-primary/40 disabled:text-black/60'
        >
          {createMutation.isPending ? "저장 중" : "규칙 추가"}
        </button>
      </form>

      <div className='mt-4 space-y-2'>
        {alertRulesQuery.isPending &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='rounded-md border border-white/10 p-3'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-48' />
                  <Skeleton className='h-3 w-40' />
                </div>
                <Skeleton className='h-9 w-16 rounded-md' />
              </div>
            </div>
          ))}
        {alertRulesQuery.isError && <p className='text-sm text-destructive'>뉴스 감성 알림 규칙을 불러오지 못했습니다.</p>}
        {!alertRulesQuery.isPending && !alertRulesQuery.isError && newsSentimentRules.length === 0 && (
          <p className='text-sm text-text-muted-dark'>등록된 뉴스 감성 알림 규칙이 없습니다.</p>
        )}
        {!alertRulesQuery.isPending && newsSentimentRules.map((rule) => {
          const ruleDirection = getRuleDirection(rule);
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === rule.id;

          return (
            <div key={rule.id} className='rounded-md border border-white/10 p-3'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium text-text-dark'>{rule.marketCode}</p>
                  <p className='mt-1 text-xs text-text-muted-dark'>
                    {ruleDirection === "UP" ? "상승" : "하락"} · {rule.comparison} {rule.threshold.toFixed(2)} ·{" "}
                    {rule.enabled ? "활성" : "비활성"}
                  </p>
                  <p className='mt-1 text-xs text-text-muted-dark'>
                    앱 {rule.sendInApp ? "ON" : "OFF"} · Slack {rule.sendSlack ? "ON" : "OFF"}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => handleDelete(rule)}
                  disabled={isDeleting}
                  className='rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-text-dark disabled:cursor-not-allowed disabled:text-text-muted-dark/50'
                >
                  {isDeleting ? "삭제 중" : "삭제"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {statusMessage && <p className='mt-3 text-xs text-text-muted-dark'>{statusMessage}</p>}
    </section>
  );
}
