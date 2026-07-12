import { Button, Popover, PopoverContent, PopoverTrigger } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">열기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-foreground text-sm">팝오버 콘텐츠 영역입니다.</p>
      </PopoverContent>
    </Popover>
  ),
};
