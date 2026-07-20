"use client";

import Image from "next/image";

import { useState } from "react";

type CoinIconProps = {
  marketCode: string;
  size?: number;
};

const getSymbol = (marketCode: string) => marketCode.replace(/^KRW-/, "");

const getHash = (value: string) => {
  return Array.from(value).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
};

export const getCoinIconColor = (symbol: string) => `oklch(0.45 0.12 ${getHash(symbol) % 360})`;

export const CoinIcon = ({ marketCode, size = 30 }: CoinIconProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const symbol = getSymbol(marketCode);
  const label = symbol.length > 4 ? symbol.slice(0, 4) : symbol;

  if (hasImageError) {
    return (
      <span
        aria-label={`${symbol} 로고 없음`}
        className='inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold text-foreground'
        style={{ width: size, height: size, backgroundColor: getCoinIconColor(symbol) }}
      >
        {label}
      </span>
    );
  }

  return (
    <Image
      alt={`${symbol} 로고`}
      className='shrink-0 rounded-full'
      height={size}
      src={`https://static.upbit.com/logos/${symbol}.png`}
      width={size}
      onError={() => setHasImageError(true)}
    />
  );
};
