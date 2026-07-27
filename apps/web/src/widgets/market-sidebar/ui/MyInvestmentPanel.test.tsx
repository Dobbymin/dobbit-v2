// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MyInvestmentPanel } from "./MyInvestmentPanel";

const mocks = vi.hoisted(() => ({
  useIsAuth: vi.fn(),
  useWalletInvestmentSummary: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

vi.mock("@/shared", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  ROUTES_PATH: { LOGIN: "/login" },
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
  formatPrice: (value: number) => value.toLocaleString("ko-KR"),
  useIsAuth: mocks.useIsAuth,
}));

vi.mock("@/features/wallet", () => ({
  useWalletInvestmentSummary: mocks.useWalletInvestmentSummary,
}));

vi.mock("@/entities/market", () => ({
  CoinIcon: () => <span />,
}));

const asset = {
  marketCode: "KRW-BTC",
  symbol: "BTC",
  koreanName: "비트코인",
  symbolPair: "BTC/KRW",
  quantity: 2,
  averagePrice: 10_000,
  totalCost: 20_000,
  currentPrice: 0,
  evaluatedAmount: 0,
  profitAmount: 0,
  profitRate: 0,
  livePrice: 0,
  liveEvaluatedAmount: 0,
  liveProfitAmount: 0,
  liveProfitRate: 0,
  isPriceAvailable: false,
};

describe("MyInvestmentPanel", () => {
  beforeEach(() => {
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true });
    mocks.useWalletInvestmentSummary.mockReturnValue({
      data: {
        assets: [asset],
        cashAmount: 0,
        totalAssetAmount: 0,
        totalPurchaseAmount: 20_000,
        totalEvaluatedAmount: 0,
        totalProfitAmount: 0,
        totalProfitRate: 0,
        allocation: [{ asset, percentage: 0 }],
      },
      isSummaryAvailable: false,
    });
  });

  it("shows unavailable values instead of a temporary -100% return", () => {
    render(<MyInvestmentPanel selectedMarketCode='KRW-BTC' />);

    expect(screen.getAllByText("-")).toHaveLength(2);
    expect(screen.queryByText("-100.00%")).toBeNull();
  });
});
