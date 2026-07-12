import { Input, Label } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Input placeholder="기본 입력" />
      <Input placeholder="비활성" disabled />
      <Input aria-invalid placeholder="오류 상태" />
    </div>
  ),
};
