// import { DeployButton } from "@/components/deploy-button";
// import { EnvVarWarning } from "@/components/env-var-warning";
// import { AuthButton } from "@/components/auth-button";
// import { Hero } from "@/components/hero";
// import { ThemeSwitcher } from "@/components/theme-switcher";
// import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
// import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
// import { hasEnvVars } from "@/lib/utils";
// import Link from "next/link";
import Header from "@/components/ui/Header";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="bg-[#875CF5]">
        <h1>Escolha sua Fandom</h1>
        <p>Explore comunidades dedicadas aos seus universos favoritos. Conecte-se com outros fãs, compartilhe teorias e celebre suas paixões.</p>
      </div>
    </main>
  );
}
