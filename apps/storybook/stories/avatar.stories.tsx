import { Avatar, AvatarFallback, AvatarImage } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="" alt="fallback" />
        <AvatarFallback>DB</AvatarFallback>
      </Avatar>
    </div>
  ),
};
