import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = [
  { name: "비트코인", price: "98,501,000", change: "-0.69%" },
  { name: "이더리움", price: "4,783,000", change: "+1.18%" },
  { name: "리플", price: "2,927", change: "-1.24%" },
];

export const Overview: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>현재가</TableHead>
          <TableHead>변동률</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.name}>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.price}</TableCell>
            <TableCell className={r.change.startsWith("+") ? "text-increase" : "text-decrease"}>
              {r.change}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
