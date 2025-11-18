import type { ComponentType } from 'react';

import { Username } from '@/pages/Username';
import { Password } from '@/pages/Password';
import { TwoFA } from '@/pages/TwoFA';
import { Home } from '@/pages/Home';

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: '/username', Component: Username },
  { path: '/password', Component: Password },
  { path: '/twofa', Component: TwoFA },
  { path: '/home', Component: Home },
];
