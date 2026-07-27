export const normalizeNickname = (value: string) => value.trim();

export const isValidNickname = (nickname: string) => nickname.length >= 2 && nickname.length <= 24;
