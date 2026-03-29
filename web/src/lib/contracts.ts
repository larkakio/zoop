import { type Address, isAddress } from "viem";

export function getCheckInContractAddress(): Address | null {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || !isAddress(raw)) return null;
  return raw;
}
