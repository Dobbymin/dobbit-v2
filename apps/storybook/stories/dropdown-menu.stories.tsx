import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">메뉴 열기</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Setting</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
