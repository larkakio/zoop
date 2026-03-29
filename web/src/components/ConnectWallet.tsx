"use client";

import { useConnect, useDisconnect, useAccount } from "wagmi";
import { useCallback, useState } from "react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connectAsync, isPending, error } = useConnect();
  const [open, setOpen] = useState(false);

  const short = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  const onPick = useCallback(
    async (id: string) => {
      const c = connectors.find((x) => x.id === id);
      if (!c) return;
      try {
        await connectAsync({ connector: c });
        setOpen(false);
      } catch {
        /* surfaced via error */
      }
    },
    [connectAsync, connectors],
  );

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-zinc-800 px-2 py-1 font-mono text-xs text-cyan-300">
          {short}
        </span>
        <button
          type="button"
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20"
        onClick={() => setOpen((o) => !o)}
      >
        Connect wallet
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-2 shadow-xl">
          <p className="mb-2 px-2 text-xs text-zinc-500">Choose a wallet</p>
          <ul className="flex flex-col gap-1">
            {connectors.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={isPending}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  onClick={() => void onPick(c.id)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-2 px-2 text-xs text-rose-400">{error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
