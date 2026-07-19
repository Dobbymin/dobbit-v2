// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ onError, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} onError={onError} />,
}));

import { CoinIcon, getCoinIconColor } from "./CoinIcon";

describe("CoinIcon", () => {
  it("uses a deterministic color for each symbol", () => {
    expect(getCoinIconColor("BTC")).toBe(getCoinIconColor("BTC"));
    expect(getCoinIconColor("BTC")).not.toBe(getCoinIconColor("ETH"));
  });

  it("shows a fallback badge when the logo fails to load", () => {
    render(<CoinIcon marketCode='KRW-BTC' />);

    fireEvent.error(screen.getByRole("img", { name: "BTC 로고" }));

    expect(screen.getByLabelText("BTC 로고 없음").textContent).toBe("BTC");
  });
});
