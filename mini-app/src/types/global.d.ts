// Types globaux pour l'application

// Déclaration pour les variables d'environnement Vite
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

// Déclaration pour window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

// Permettre l'import de fichiers .jsx depuis TypeScript
declare module "*.jsx" {
  import { ComponentType } from "react";
  const Component: ComponentType<any>;
  export default Component;
}

export {};

