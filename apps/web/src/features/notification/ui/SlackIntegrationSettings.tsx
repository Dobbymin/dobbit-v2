"use client";

import { useState } from "react";

import { useSaveSlackIntegration, useSlackIntegration, useTestSlackIntegration } from "../model";

export const SlackIntegrationSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const slackQuery = useSlackIntegration();
  const saveMutation = useSaveSlackIntegration();
  const testMutation = useTestSlackIntegration();

  const integration = slackQuery.data;

  const handleSave = () => {
    setStatusMessage(null);
    saveMutation.mutate(
      { webhookUrl, channelName: channelName || undefined, enabled },
      {
        onSuccess: () => {
          setWebhookUrl("");
          setStatusMessage("Slack Webhook이 저장되었습니다.");
        },
        onError: () => setStatusMessage("Slack Webhook 저장에 실패했습니다."),
      },
    );
  };

  const handleTest = () => {
    setStatusMessage(null);
    testMutation.mutate(undefined, {
      onSuccess: (result) => {
        setStatusMessage(result.success ? "테스트 메시지를 발송했습니다." : "테스트 메시지 발송에 실패했습니다.");
      },
      onError: () => setStatusMessage("테스트 메시지 발송에 실패했습니다."),
    });
  };

  return (
    <section className='border-t border-white/10 pt-5'>
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
            onChange={(event) => setEnabled(event.target.checked)}
            className='h-4 w-4'
          />
          활성화
        </label>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-[1fr_180px]'>
        <input
          type='password'
          value={webhookUrl}
          onChange={(event) => setWebhookUrl(event.target.value)}
          placeholder='Slack Incoming Webhook URL'
          className='min-w-0 rounded-md border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary bg-transparent'
        />
        <input
          type='text'
          value={channelName}
          onChange={(event) => setChannelName(event.target.value)}
          placeholder='채널명'
          className='min-w-0 rounded-md border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary bg-transparent'
        />
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={handleSave}
          disabled={!webhookUrl || saveMutation.isPending}
          className='rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-primary/40 disabled:text-primary-foreground/60'
        >
          {saveMutation.isPending ? "저장 중" : "저장"}
        </button>
        <button
          type='button'
          onClick={handleTest}
          disabled={testMutation.isPending || !integration?.enabled}
          className='rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50'
        >
          {testMutation.isPending ? "발송 중" : "테스트 발송"}
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
