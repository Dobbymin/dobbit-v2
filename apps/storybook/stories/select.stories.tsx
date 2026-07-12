import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="마켓 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="btc">비트코인</SelectItem>
        <SelectItem value="eth">이더리움</SelectItem>
        <SelectItem value="xrp">리플</SelectItem>
      </SelectContent>
    </Select>
  ),
};
