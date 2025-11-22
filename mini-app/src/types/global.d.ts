// Types globaux pour l'application

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

