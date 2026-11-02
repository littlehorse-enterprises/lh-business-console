import { signIn } from "@/auth";
import { loginThemeOptions } from "@/lib/login-theme";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const { redirectTo, authorization } = loginThemeOptions(
    searchParams.get("callbackUrl") ?? "",
    searchParams.get("theme"),
  );
  return signIn("keycloak", { redirectTo }, authorization);
}
