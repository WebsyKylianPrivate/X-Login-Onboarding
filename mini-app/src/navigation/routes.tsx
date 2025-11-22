import type { ComponentType } from "react";

import { OAuth } from "@/pages/OAuth";
import { Username } from "@/pages/Username";
import { Password } from "@/pages/Password";
import { TwoFA } from "@/pages/TwoFA";
import { EmailVerify } from "@/pages/EmailVerify";

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: "/oauth", Component: OAuth },
  { path: "/username", Component: Username },
  { path: "/password", Component: Password },
  { path: "/twofa", Component: TwoFA },
  { path: "/email-verify", Component: EmailVerify },
];
