import { useState } from "react";
import "./App.css";
// Exemple d'utilisation des alias
import { ExampleComponent } from "@components/ExampleComponent";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>X Login Onboarding</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <ExampleComponent />
      <p className="read-the-docs">
        Les alias sont configurés et fonctionnels ! 🚀
      </p>
    </div>
  );
}

export default App;
