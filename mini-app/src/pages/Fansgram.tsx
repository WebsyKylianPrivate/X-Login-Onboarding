// src/pages/Fansgram.tsx
import { useEffect, useState } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";
import { GameProvider, useGame } from "../fansgram/context/GameContext";
import Header from "../fansgram/components/layout/Header";
import BottomNav from "../fansgram/components/layout/BottomNav";
import Shop from "../fansgram/features/shop/Shop";
import History from "../fansgram/features/history/History";
import Profile from "../fansgram/features/profile/Profile";
import Home from "../fansgram/features/home/Home";
import LoginPage from "../fansgram/features/auth/LoginPage";

// Composant Wrapper pour gérer la navigation
const GameApp = () => {
  const { isAuthenticated, refreshAuth } = useGame();
  const [currentView, setCurrentView] = useState<
    "home" | "shop" | "history" | "profile"
  >("home");
  const [showLogin, setShowLogin] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
    null
  );
  const [selectedShopSlug, setSelectedShopSlug] = useState<string | null>(null);
  const [hasStartParam, setHasStartParam] = useState(false); // Flag pour savoir si on a un start_param

  // Stocker le dernier shop visité pour pouvoir y retourner
  const [lastVisitedShop, setLastVisitedShop] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor("#000000");
      window.Telegram.WebApp.setBackgroundColor("#000000");
    }
  }, []);

  // Détecter le start_param au chargement et rediriger vers le shop
  //
  // Pour tester localement, utilisez l'URL query string :
  // http://localhost:5173/?startapp=shop_trista
  // http://localhost:5173/?startapp=shop_mayumi
  // http://localhost:5173/?startapp=shop_noemie
  useEffect(() => {
    let startParam: string | null = null;

    try {
      // Méthode 1: Depuis les launchParams (recommandé pour Telegram)
      const launchParams = retrieveLaunchParams();
      startParam = launchParams.tgWebAppStartParam || null;
    } catch (e) {
      console.log("⚠️ Impossible de récupérer launchParams:", e);
    }

    // Méthode 2: Depuis initDataUnsafe (fallback)
    if (!startParam) {
      startParam =
        (window.Telegram?.WebApp as any)?.initDataUnsafe?.start_param || null;
    }

    // Méthode 3: Depuis l'URL query string (pour tests locaux)
    // Exemple: ?startapp=shop_trista
    if (!startParam) {
      const urlParams = new URLSearchParams(window.location.search);
      startParam = urlParams.get("startapp") || null;
    }

    if (startParam && startParam.startsWith("shop_")) {
      const slug = startParam.slice(5); // Enlever "shop_"

      // Vérifier que le slug n'est pas vide
      if (!slug || slug.trim() === "") {
        console.log(`⚠️ Slug invalide dans start_param: "${startParam}"`);
        return; // Ne pas rediriger si le slug est vide
      }

      console.log(`🔗 start_param détecté: ${slug}`);

      // Capitaliser la première lettre pour le nom du folder
      const folderName = slug.charAt(0).toUpperCase() + slug.slice(1);

      // Marquer qu'on a un start_param pour éviter le reset
      setHasStartParam(true);

      // Rediriger vers le shop
      setSelectedFolderName(folderName);
      setSelectedShopSlug(slug);
      setLastVisitedShop({ slug, name: folderName }); // Mémoriser le shop
      setCurrentView("shop");
    }
  }, []);

  // Rafraîchir l'auth quand on revient sur la page (après connexion)
  useEffect(() => {
    const handleFocus = () => {
      refreshAuth();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshAuth]);

  // Reset view to home when connecting (mais pas si on a un start_param)
  useEffect(() => {
    if (isAuthenticated && !hasStartParam) {
      // Seulement reset si on n'a pas de start_param qui nous a redirigé vers un shop
      setCurrentView("home");
      setShowLogin(false);
      setSelectedFolderName(null);
      setSelectedShopSlug(null);
    } else if (isAuthenticated) {
      // Si on est authentifié ET qu'on a un start_param, juste fermer le login
      setShowLogin(false);
    }
  }, [isAuthenticated, hasStartParam]);

  // Afficher LoginPage si demandé
  if (showLogin) {
    return <LoginPage onCancel={() => setShowLogin(false)} />;
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case "history":
        return "History";
      case "profile":
        return "Profile";
      case "shop":
        return selectedFolderName || "Items";
      case "home":
      default:
        return "Top Folders";
    }
  };

  const handleBack = () => {
    setCurrentView("home");
    setSelectedFolderName(null);
    setSelectedShopSlug(null);
    setLastVisitedShop(null); // Nettoyer le dernier shop visité quand on retourne manuellement à home
  };

  const handleNavigateToShop = (folderName: string, shopSlug: string) => {
    setSelectedFolderName(folderName);
    setSelectedShopSlug(shopSlug);
    setLastVisitedShop({ slug: shopSlug, name: folderName }); // Mémoriser le shop
    setCurrentView("shop");
  };

  // Callback pour gérer les erreurs de shop (shop inexistant)
  const handleShopError = () => {
    console.log("⚠️ Shop inexistant, redirection vers Top Folders");
    setCurrentView("home");
    setSelectedFolderName(null);
    setSelectedShopSlug(null);
    setHasStartParam(false); // Réinitialiser le flag pour permettre le reset normal
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header
        title={getHeaderTitle()}
        onRequireLogin={() => setShowLogin(true)}
        showBackButton={currentView === "shop"}
        onBack={handleBack}
      />

      <main className="flex-1 w-full overflow-y-auto">
        {currentView === "home" && (
          <Home onNavigateToShop={handleNavigateToShop} />
        )}
        {currentView === "shop" && selectedShopSlug && (
          <Shop
            shopSlug={selectedShopSlug}
            onRequireLogin={() => setShowLogin(true)}
            onShopNotFound={handleShopError}
          />
        )}
        {currentView === "history" && <History />}
        {currentView === "profile" && <Profile />}
      </main>

      <BottomNav
        currentView={currentView}
        onChange={(view) => {
          // Si on change vers home, history ou profile, nettoyer le shop sélectionné actuel
          // mais garder lastVisitedShop en mémoire pour pouvoir y retourner
          if (view === "home" || view === "history" || view === "profile") {
            setSelectedShopSlug(null);
            setSelectedFolderName(null);
            setCurrentView(view);
            return;
          }

          // Si on clique sur "shop" (Grid)
          if (view === "shop") {
            // Si on est déjà sur home, ne rien faire (rester sur home)
            if (currentView === "home") {
              return;
            }

            // Si on est déjà sur un shop, ne rien faire (rester sur le shop actuel)
            if (currentView === "shop") {
              return;
            }

            // Si on vient de history ou profile, retourner au dernier shop visité
            if (lastVisitedShop) {
              setSelectedFolderName(lastVisitedShop.name);
              setSelectedShopSlug(lastVisitedShop.slug);
              setCurrentView("shop");
            } else {
              // Pas de shop visité, aller vers home
              setCurrentView("home");
            }
          }
        }}
        onRequireLogin={() => setShowLogin(true)}
      />
    </div>
  );
};

export const Fansgram = () => {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
};
