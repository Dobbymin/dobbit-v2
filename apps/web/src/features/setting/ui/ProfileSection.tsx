"use client";

import { useEffect } from "react";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useProfile, useUpdateNickname } from "../model";

const profileSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").max(24, "닉네임은 24자 이하여야 합니다."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileSection = () => {
  const profile = useProfile();
  const updateNickname = useUpdateNickname();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
    },
  });

  useEffect(() => {
    if (profile.data) {
      form.reset({ nickname: profile.data.nickname ?? "" });
    }
  }, [form, profile.data]);

  return (
    <section className='rounded-lg border bg-card p-5'>
      <div className='mb-5'>
        <h2 className='text-base font-semibold'>프로필</h2>
        <p className='mt-1 text-sm text-muted-foreground'>{profile.isLoading ? "불러오는 중" : profile.data?.email}</p>
      </div>
      <form className='space-y-4' onSubmit={form.handleSubmit((values) => updateNickname.mutate(values))}>
        <Form {...form}>
          <FormField
            control={form.control}
            name='nickname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input placeholder='닉네임' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {updateNickname.isError ? <p className='text-sm text-destructive'>{updateNickname.error.message}</p> : null}
          <Button disabled={updateNickname.isPending} type='submit'>
            {updateNickname.isPending ? "변경 중" : "닉네임 변경"}
          </Button>
        </Form>
      </form>
    </section>
  );
};
