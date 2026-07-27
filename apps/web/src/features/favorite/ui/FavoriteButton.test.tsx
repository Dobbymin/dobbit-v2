// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FavoriteButton } from "./FavoriteButton";

const mocks = vi.hoisted(() => ({
  toggleFavorite: vi.fn(),
  useFavoriteButton: vi.fn(),
}));

vi.mock("../model", () => ({
  useFavoriteButton: mocks.useFavoriteButton,
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a login popover without calling data hooks when unauthenticated", () => {
    mocks.useFavoriteButton.mockReturnValue({ isAuthenticated: false });

    render(<FavoriteButton marketCode='KRW-BTC' />);
    fireEvent.click(screen.getByRole("button", { name: "관심 등록" }));

    expect(screen.getByText("관심 등록이 필요해요")).toBeTruthy();
    expect(screen.getByRole("link", { name: "로그인" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: "회원가입" }).getAttribute("href")).toBe("/signup");
  });

  it("toggles the current favorite state when authenticated", () => {
    mocks.useFavoriteButton.mockReturnValue({
      toggleFavorite: mocks.toggleFavorite,
      isAuthenticated: true,
      isFavorited: true,
    });

    render(<FavoriteButton marketCode='KRW-BTC' />);
    fireEvent.click(screen.getByRole("button", { name: "관심 해제" }));

    expect(mocks.toggleFavorite).toHaveBeenCalled();
  });
});
