import { Attribution } from "ox/erc8021";
import { type Hex, concatHex, encodeFunctionData, isHex } from "viem";

export const zoopCheckInAbi = [
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "lastCheckInDay",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "streakOf",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export function buildCheckInCalldata(): Hex {
  const baseData = encodeFunctionData({
    abi: zoopCheckInAbi,
    functionName: "checkIn",
  });

  const rawSuffix = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (rawSuffix && isHex(rawSuffix)) {
    return concatHex([baseData, rawSuffix]);
  }

  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (code) {
    const suffix = Attribution.toDataSuffix({ codes: [code] });
    return concatHex([baseData, suffix]);
  }

  return baseData;
}
