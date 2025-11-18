/**
 * Exemple de types TypeScript
 * 
 * Import depuis n'importe où avec :
 * import type { User } from '@types'
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

