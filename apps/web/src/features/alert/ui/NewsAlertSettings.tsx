"use client";

import { Skeleton } from "@/shared";

import { useNewsAlertSettings } from "../model";
import { type NewsAlertDirection, getNewsAlertDirection } from "../utils";

export function NewsAlertSettings() {
  const {
    marketCode,
    direction,
    threshold,
    sendInApp,
    sendSlack,
    statusMessage,
    newsSentimentRules,
    isRulesPending,
    isRulesError,
    isCreatePending,
    isDeletingRule,
    changeMarketCode,
    changeDirection,
    changeThreshold,
    changeSendInApp,
    changeSendSlack,
    submitNewsAlert,
    deleteNewsAlert,
  } = useNewsAlertSettings();

  return (
    <section className='border-t border-border pt-5'>
      <div>
        <h2 className='text-base font-semibold text-foreground'>뉴스 감성 알림</h2>
        <p className='mt-1 text-sm text-muted-foreground'>뉴스 감성 점수가 기준을 넘으면 알림을 받습니다.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitNewsAlert();
        }}
        className='mt-4 space-y-3'
      >
        <div className='grid gap-3 md:grid-cols-[1fr_120px_120px]'>
          <input
            type='text'
            value={marketCode}
            onChange={(event) => changeMarketCode(event.target.value)}
            placeholder='BTC 또는 KRW-BTC'
            className='min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'
          />
          <select
            value={direction}
            onChange={(event) => changeDirection(event.target.value as NewsAlertDirection)}
            className='min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-primary [&>option]:bg-card'
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
            onChange={(event) => changeThreshold(event.target.value)}
            className='min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'
          />
        </div>

        <div className='flex flex-wrap items-center gap-4 text-sm text-foreground'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={sendInApp}
              onChange={(event) => changeSendInApp(event.target.checked)}
              className='h-4 w-4'
            />
            앱 알림
          </label>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={sendSlack}
              onChange={(event) => changeSendSlack(event.target.checked)}
              className='h-4 w-4'
            />
            Slack
          </label>
        </div>

        <button
          type='submit'
          disabled={!marketCode.trim() || isCreatePending}
          className='rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-primary/40 disabled:text-primary-foreground/60'
        >
          {isCreatePending ? "저장 중" : "규칙 추가"}
        </button>
      </form>

      <div className='mt-4 space-y-2'>
        {isRulesPending &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='rounded-md border border-border p-3'>
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
        {isRulesError && <p className='text-sm text-destructive'>뉴스 감성 알림 규칙을 불러오지 못했습니다.</p>}
        {!isRulesPending && !isRulesError && newsSentimentRules.length === 0 && (
          <p className='text-sm text-muted-foreground'>등록된 뉴스 감성 알림 규칙이 없습니다.</p>
        )}
        {!isRulesPending &&
          newsSentimentRules.map((rule) => {
            const ruleDirection = getNewsAlertDirection(rule);
            const isDeleting = isDeletingRule(rule.id);

            return (
              <div key={rule.id} className='rounded-md border border-border p-3'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-foreground'>{rule.marketCode}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {ruleDirection === "UP" ? "상승" : "하락"} · {rule.comparison} {rule.threshold.toFixed(2)} ·{" "}
                      {rule.enabled ? "활성" : "비활성"}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      앱 {rule.sendInApp ? "ON" : "OFF"} · Slack {rule.sendSlack ? "ON" : "OFF"}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => deleteNewsAlert(rule)}
                    disabled={isDeleting}
                    className='rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50'
                  >
                    {isDeleting ? "삭제 중" : "삭제"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {statusMessage && <p className='mt-3 text-xs text-muted-foreground'>{statusMessage}</p>}
    </section>
  );
}
