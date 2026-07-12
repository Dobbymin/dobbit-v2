import { Progress } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Progress",
  component: Progress,
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      {[25, 50, 75, 100].map((v) => (
        <Progress key={v} value={v} />
      ))}
    </div>
  ),
};
