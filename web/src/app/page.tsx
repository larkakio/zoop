import { ConnectWallet } from "@/components/ConnectWallet";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { NetworkBanner } from "@/components/NetworkBanner";
import { SiweButton } from "@/components/SiweButton";
import { ZoopGame } from "@/components/ZoopGame";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6 pb-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              Zoop
            </h1>
            <p className="text-sm text-zinc-400">
              Swipe the grid. Collect the orbs. Built for Base.
            </p>
          </div>
          <ConnectWallet />
        </div>
        <NetworkBanner />
      </header>

      <ZoopGame />

      <section className="mt-2 flex flex-col gap-3">
        <DailyCheckIn />
        <SiweButton />
      </section>
    </main>
  );
}
