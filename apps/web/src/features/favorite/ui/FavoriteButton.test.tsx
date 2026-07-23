// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FavoriteButton } from "./FavoriteButton";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  useFavorites: vi.fn(),
  useIsAuth: vi.fn(),
  useToggleFavorite: vi.fn(),
}));

vi.mock("@/shared/store", () => ({
  useIsAuth: mocks.useIsAuth,
}));

vi.mock("../model", () => ({
  useFavorites: mocks.useFavorites,
  useToggleFavorite: mocks.useToggleFavorite,
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a login popover without calling data hooks when unauthenticated", () => {
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    render(<FavoriteButton marketCode='KRW-BTC' />);
    fireEvent.click(screen.getByRole("button", { name: "관심 등록" }));

    expect(mocks.useFavorites).not.toHaveBeenCalled();
    expect(mocks.useToggleFavorite).not.toHaveBeenCalled();
    expect(screen.getByText("관심 등록이 필요해요")).toBeTruthy();
    expect(screen.getByRole("link", { name: "로그인" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: "회원가입" }).getAttribute("href")).toBe("/signup");
  });

  it("toggles the current favorite state when authenticated", () => {
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mocks.useFavorites.mockReturnValue({ data: new Set(["KRW-BTC"]) });
    mocks.useToggleFavorite.mockReturnValue({ mutate: mocks.mutate });

    render(<FavoriteButton marketCode='KRW-BTC' />);
    fireEvent.click(screen.getByRole("button", { name: "관심 해제" }));

    expect(mocks.mutate).toHaveBeenCalledWith({ marketCode: "KRW-BTC", isFavorited: true });
  });
});
