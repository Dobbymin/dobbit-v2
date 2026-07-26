"use client";

import { useState } from "react";

import { parseNumericInput, parseNumericInputWithDecimal } from "@/shared";

import { calculateOrderAmount, calculateOrderTotal } from "./libs";

export const useOrderValues = () => {
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");

  const changePrice = (value: string) => {
    const cleaned = parseNumericInputWithDecimal(value);
    setPrice(cleaned);
    setTotal(calculateOrderTotal(cleaned, amount));
  };

  const changeAmount = (value: string) => {
    const cleaned = parseNumericInputWithDecimal(value);
    setAmount(cleaned);
    setTotal(calculateOrderTotal(price, cleaned));
  };

  const changeTotal = (value: string) => {
    const cleaned = parseNumericInput(value);
    const normalized = cleaned === "" ? "" : String(Number(cleaned));
    setTotal(normalized);
    setAmount(calculateOrderAmount(price, normalized));
  };

  const reset = () => {
    setPrice("");
    setAmount("");
    setTotal("");
  };

  const isValid =
    Number.isFinite(Number(price)) && Number(price) > 0 && Number.isFinite(Number(amount)) && Number(amount) > 0;

  return { price, amount, total, isValid, changePrice, changeAmount, changeTotal, reset };
};
