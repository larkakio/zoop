"use client";

import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { useCallback, useState } from "react";

/**
 * Optional SIWE flow — proves control of the connected address (client-side verify only).
 */
export function SiweButton() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<
    "idle" | "signing" | "ok" | "err"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSign = useCallback(async () => {
    if (!isConnected || !address || !chainId || !publicClient) return;
    setStatus("signing");
    setMessage(null);
    const nonce = generateSiweNonce();
    try {
      const siwe = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
      });
      const signature = await signMessageAsync({ message: siwe });
      const valid = await publicClient.verifySiweMessage({
        message: siwe,
        signature,
      });
      if (!valid) {
        setStatus("err");
        setMessage("Signature did not verify.");
        return;
      }
      setStatus("ok");
      setMessage("Signed in with Ethereum.");
    } catch (e) {
      const err = e as { message?: string };
      const m = err.message ?? "";
      if (
        m.includes("User rejected") ||
        m.includes("rejected") ||
        m.includes("denied")
      ) {
        setMessage("You cancelled the signature request.");
      } else {
        setMessage(m || "Something went wrong.");
      }
      setStatus("err");
    }
  }, [
    address,
    chainId,
    isConnected,
    publicClient,
    signMessageAsync,
  ]);

  if (!isConnected) return null;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
      <button
        type="button"
        disabled={status === "signing"}
        className="w-full rounded-lg border border-fuchsia-500/40 py-2 text-sm text-fuchsia-200 disabled:opacity-50"
        onClick={() => void onSign()}
      >
        {status === "signing" ? "Sign in wallet…" : "Sign with wallet (SIWE)"}
      </button>
      {message && (
        <p
          className={`mt-2 text-xs ${
            status === "ok" ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
