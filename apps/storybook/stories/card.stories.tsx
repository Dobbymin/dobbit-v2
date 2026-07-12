import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@dobbit/ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>월간 리포트</CardTitle>
        <CardDescription>2026년 7월 요약</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">카드 본문 콘텐츠 영역입니다.</p>
      </CardContent>
      <CardFooter>
        <Button>확인</Button>
      </CardFooter>
    </Card>
  ),
};
