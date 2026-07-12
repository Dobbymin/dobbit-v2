import { Button } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const SIZES = ["sm", "default", "lg"] as const;

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {SIZES.map((s) => (
          <Button key={s} size={s}>
            size {s}
          </Button>
        ))}
        <Button disabled>disabled</Button>
      </div>
    </div>
  ),
};

export const Default: Story = { args: { children: "Button" } };
