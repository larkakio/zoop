"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { targetChain, targetChainId } from "@/lib/chain";

export function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === targetChainId) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/50 bg-amber-950/50 px-3 py-2 text-sm text-amber-100">
      <span>Wrong network — switch to {targetChain.name}.</span>
      <button
        type="button"
        disabled={isPending}
        className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 font-medium text-zinc-950 disabled:opacity-50"
        onClick={() => switchChain({ chainId: targetChainId })}
      >
        {isPending ? "…" : "Switch"}
      </button>
    </div>
  );
}
