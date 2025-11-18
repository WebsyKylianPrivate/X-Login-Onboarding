// Exemple de composant utilisant les alias
import { useState } from "react";

/**
 * Composant d'exemple pour démontrer l'utilisation des alias
 *
 * Vous pouvez importer depuis n'importe quel alias configuré :
 * - @components, @pages, @hooks, @utils, @types, etc.
 */
export const ExampleComponent = () => {
  const [message] = useState("Les alias fonctionnent ! 🎉");

  return (
    <div>
      <h2>Exemple de composant</h2>
      <p>{message}</p>
      <p>
        Ce composant est importé depuis{" "}
        <code>@components/ExampleComponent</code>
      </p>
    </div>
  );
};
