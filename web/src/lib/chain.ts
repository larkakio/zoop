import { base, baseSepolia } from "wagmi/chains";

const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");

export const targetChain = id === 84532 ? baseSepolia : base;

export const targetChainId = targetChain.id;
