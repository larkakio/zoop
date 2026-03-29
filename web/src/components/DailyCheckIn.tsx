"use client";

import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { getCheckInContractAddress } from "@/lib/contracts";
import { buildCheckInCalldata, zoopCheckInAbi } from "@/lib/zoop-check-in";
import { targetChain } from "@/lib/chain";

export function DailyCheckIn() {
  const { address, isConnected } = useAccount();
  const contractAddress = useMemo(() => getCheckInContractAddress(), []);
  const [txHash, setTxHash] = useState<Hex | undefined>();

  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: contractAddress ?? undefined,
    abi: zoopCheckInAbi,
    functionName: "streakOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address && isConnected) },
  });

  const { sendTransactionAsync, isPending: isSending, error: sendError } =
    useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const busy = isSending || isConfirming;

  const onCheckIn = useCallback(async () => {
    if (!contractAddress || !address) return;
    setTxHash(undefined);
    try {
      const hash = await sendTransactionAsync({
        to: contractAddress,
        data: buildCheckInCalldata(),
        value: 0n,
        chainId: targetChain.id,
      });
      setTxHash(hash);
    } catch {
      /* error surfaces via sendError or user cancel */
    }
  }, [address, contractAddress, sendTransactionAsync]);

  const err = sendError;

  useEffect(() => {
    if (!isSuccess) return;
    void refetchStreak();
  }, [isSuccess, refetchStreak]);

  if (!isConnected) {
    return (
      <p className="text-center text-xs text-zinc-500">
        Connect a wallet to check in on-chain.
      </p>
    );
  }

  if (!contractAddress) {
    return (
      <p className="text-center text-xs text-amber-200/90">
        Set{" "}
        <code className="rounded bg-zinc-800 px-1">
          NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS
        </code>{" "}
        after deploy.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-zinc-950/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-200">Daily check-in</h3>
        {streak != null && (
          <span className="text-xs text-zinc-400">
            Streak:{" "}
            <span className="text-fuchsia-400">{String(streak)}</span>
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        One transaction per UTC day. You only pay Base L2 gas — no app fee.
      </p>
      <button
        type="button"
        disabled={busy}
        className="w-full rounded-lg bg-cyan-700 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        onClick={() => void onCheckIn()}
      >
        {busy ? "Confirm in wallet…" : "Check in on-chain"}
      </button>
      {txHash && (
        <p className="mt-2 truncate text-xs text-emerald-400/90">Tx: {txHash}</p>
      )}
      {err && (
        <p className="mt-2 text-xs text-rose-400">
          {err.message.includes("User rejected") ||
          err.message.includes("rejected")
            ? "You cancelled the request in your wallet."
            : err.message}
        </p>
      )}
    </div>
  );
}
