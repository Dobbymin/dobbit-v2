"use client";

import { useSlackIntegrationSettings } from "../model";

export const SlackIntegrationSettings = () => {
  const {
    integration,
    webhookUrl,
    channelName,
    enabled,
    statusMessage,
    isSavePending,
    isTestPending,
    changeWebhookUrl,
    changeChannelName,
    changeEnabled,
    saveSlackIntegration,
    testSlackIntegration,
  } = useSlackIntegrationSettings();

  return (
    <section className='border-t border-border pt-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-foreground'>Slack 알림</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            {integration?.enabled ? "연결됨" : "연결되지 않음"}
            {integration?.channelName ? ` · ${integration.channelName}` : ""}
          </p>
        </div>
        <label className='flex items-center gap-2 text-sm text-foreground'>
          <input
            type='checkbox'
            checked={enabled}
            onChange={(event) => changeEnabled(event.target.checked)}
            className='h-4 w-4'
          />
          활성화
        </label>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-[1fr_180px]'>
        <input
          type='password'
          value={webhookUrl}
          onChange={(event) => changeWebhookUrl(event.target.value)}
          placeholder='Slack Incoming Webhook URL'
          className='min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'
        />
        <input
          type='text'
          value={channelName}
          onChange={(event) => changeChannelName(event.target.value)}
          placeholder='채널명'
          className='min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'
        />
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={saveSlackIntegration}
          disabled={!webhookUrl || isSavePending}
          className='rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-primary/40 disabled:text-primary-foreground/60'
        >
          {isSavePending ? "저장 중" : "저장"}
        </button>
        <button
          type='button'
          onClick={testSlackIntegration}
          disabled={isTestPending || !integration?.enabled}
          className='rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50'
        >
          {isTestPending ? "발송 중" : "테스트 발송"}
        </button>
      </div>

      <div className='mt-3 space-y-1 text-xs text-muted-foreground'>
        {integration?.lastTestedAt && (
          <p>마지막 테스트: {new Date(integration.lastTestedAt).toLocaleString("ko-KR")}</p>
        )}
        {integration?.lastErrorMessage && <p className='text-destructive'>최근 오류: {integration.lastErrorMessage}</p>}
        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </section>
  );
};
