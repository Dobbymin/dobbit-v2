import { Separator } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-foreground text-sm">위 콘텐츠</div>
      <Separator />
      <div className="text-foreground text-sm">아래 콘텐츠</div>
      <div className="flex h-8 items-center gap-3">
        <span className="text-foreground text-sm">A</span>
        <Separator orientation="vertical" />
        <span className="text-foreground text-sm">B</span>
      </div>
    </div>
  ),
};
