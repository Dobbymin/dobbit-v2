// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFavoriteButton } from "./useFavoriteButton";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  useFavorites: vi.fn(),
  useIsAuth: vi.fn(),
  useToggleFavorite: vi.fn(),
}));

vi.mock("@/shared/store", () => ({ useIsAuth: mocks.useIsAuth }));
vi.mock("./useFavorites", () => ({ useFavorites: mocks.useFavorites }));
vi.mock("./useToggleFavorite", () => ({ useToggleFavorite: mocks.useToggleFavorite }));

const FavoriteButton = () => {
  const { toggleFavorite } = useFavoriteButton("KRW-BTC");

  return <button onClick={toggleFavorite}>관심</button>;
};

describe("useFavoriteButton", () => {
  it("stops propagation and toggles authenticated favorite payload", () => {
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true });
    mocks.useFavorites.mockReturnValue({ data: new Set(["KRW-BTC"]) });
    mocks.useToggleFavorite.mockReturnValue({ mutate: mocks.mutate });
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <FavoriteButton />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "관심" }));

    expect(parentClick).not.toHaveBeenCalled();
    expect(mocks.mutate).toHaveBeenCalledWith({ marketCode: "KRW-BTC", isFavorited: true });
  });
});
