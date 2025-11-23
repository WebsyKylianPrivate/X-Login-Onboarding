import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useSignal, initData } from "@tma.js/sdk-react";
import { Info, Lock, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import Lightbox from "../../components/ui/Lightbox";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import type {
  ShopItem,
  ShopListResponse,
  ShopCategory,
} from "../../types/shop";

const ITEMS_PER_PAGE = 6;

interface ShopProps {
  shopSlug: string;
  onRequireLogin?: () => void;
  onShopNotFound?: () => void;
}

interface Shop {
  id: string;
  slug: string;
  name: string;
  avatar_url?: string;
}

interface ShopResponse {
  ok: boolean;
  shop?: Shop;
  error?: string;
}

interface PurchasesResponse {
  ok: boolean;
  unlockedIds?: string[];
  error?: string;
}

const Shop: React.FC<ShopProps> = ({ shopSlug, onRequireLogin, onShopNotFound }) => {
  const initDataRaw = useSignal(initData.raw);
  const [activeTab, setActiveTab] = useState<ShopCategory>("photos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopUnlockedItems, setShopUnlockedItems] = useState<string[]>([]); // État local pour les items débloqués de ce shop
  const { user, unlockItem, showToast, isAuthenticated, setUser } = useGame();

  // 1) Fetch shop par slug pour obtenir shopId
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get<ShopResponse>(
          `${API_BASE}/shops/${shopSlug}`
        );

        if (response.data.ok && response.data.shop) {
          setShopId(response.data.shop.id);
          setError(null);
        } else {
          // Shop non trouvé
          const errorMsg = response.data.error || "Shop not found";
          setError(errorMsg);
          setShopId(null);
          
          // Notifier le parent pour rediriger vers home
          if (onShopNotFound && (errorMsg === "SHOP_NOT_FOUND" || errorMsg === "Shop not found")) {
            onShopNotFound();
          }
        }
      } catch (err: unknown) {
        console.error("Shop fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load shop";
        setError(errorMessage);
        setShopId(null);
        
        // Si c'est une erreur 404, le shop n'existe pas
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (onShopNotFound) {
            onShopNotFound();
          }
        }
      }
    };

    fetchShop();
  }, [shopSlug, onShopNotFound]);

  // 2) Fetch items avec shopId
  useEffect(() => {
    if (!shopId) return;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ShopListResponse>(
          `${API_BASE}/shop/items`,
          {
            params: {
              shopId: shopId,
              category: activeTab,
              page: currentPage,
              perPage: ITEMS_PER_PAGE,
              active: "true",
            },
          }
        );

        if (response.data.ok) {
          setItems(response.data.items);
          setTotalPages(response.data.totalPages);
        } else {
          setError(response.data.error || "Failed to load items");
          setItems([]);
        }
      } catch (err: unknown) {
        console.error("Shop items fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load items";
        setError(errorMessage);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [shopId, activeTab, currentPage]);

  // 3) Si authentifié => fetch purchases pour ce shop spécifique
  useEffect(() => {
    if (!shopId || !isAuthenticated || !initDataRaw) {
      // Si pas authentifié, reset les items débloqués de ce shop
      setShopUnlockedItems([]);
      return;
    }

    const fetchPurchases = async () => {
      try {
        const response = await axios.post<PurchasesResponse>(
          `${API_BASE}/wallet/purchases`,
          {
            initData: initDataRaw,
            shopId: shopId,
          }
        );

        if (response.data.ok && response.data.unlockedIds) {
          // Mettre à jour l'état local pour ce shop uniquement
          setShopUnlockedItems(response.data.unlockedIds);
          console.log(`✅ Purchases chargées pour shop ${shopId}:`, response.data.unlockedIds);
        } else {
          setShopUnlockedItems([]);
        }
      } catch (err: unknown) {
        console.error("Purchases fetch error:", err);
        setShopUnlockedItems([]);
      }
    };

    fetchPurchases();
  }, [shopId, isAuthenticated, initDataRaw]);

  const handleUnlock = async (item: ShopItem): Promise<void> => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      // Rediriger vers la page de login
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }

    // Comportement normal si isLogin est true
    if (!shopId) {
      showToast("Shop not loaded", "error");
      return;
    }
    const result = await unlockItem(item.id, item.price, shopId);
    if (window.Telegram?.WebApp?.HapticFeedback && result.success) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }

    if (result.message) {
      showToast(result.message, result.success ? "success" : "error");
    }
    
    // Si l'achat a réussi, ajouter l'item aux items débloqués de ce shop
    if (result.success) {
      setShopUnlockedItems((prev) => [...prev, item.id]);
    }
  };

  const handleImageClick = (item: ShopItem, isUnlocked: boolean): void => {
    if (isUnlocked) {
      setSelectedImage(item.image_url);
    } else {
      handleUnlock(item);
    }
  };

  const changePage = (newPage: number): void => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="p-4 flex-col w-full">
        {/* Tabs */}
        <div className="tab-container">
          {(["photos", "video"] as ShopCategory[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size={32} className="animate-spin text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-400">
              Loading items...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium text-gray-400">{error}</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="shop-grid" style={{ paddingBottom: totalPages > 1 ? '0' : '100px' }}>
              {items.map((item) => {
                // Utiliser les items débloqués spécifiques à ce shop
                const isUnlocked = shopUnlockedItems.includes(item.id);

                return (
                  <div key={item.id} className="item-card">
                    <div className="flex justify-between mb-4 items-center">
                      <span className="font-bold text-sm text-gray-300">
                        {item.name}
                      </span>
                      <Info size={16} color="rgba(255,255,255,0.3)" />
                    </div>

                    <div
                      className="item-image-container"
                      onClick={() => handleImageClick(item, isUnlocked)}
                      style={{ cursor: isUnlocked ? "pointer" : "default" }}
                    >
                      {/* Image avec Lazy Loading */}
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className={`item-image ${
                          isUnlocked ? "unlocked" : "blurred"
                        }`}
                      />

                      {/* Overlay si verrouillé */}
                      {!isUnlocked && (
                        <div className="lock-overlay">
                          <Lock size={24} color="white" />
                          <div className="price-tag">{item.price} 💎</div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleUnlock(item)}
                      disabled={isUnlocked}
                      className="btn-primary"
                    >
                      {isUnlocked ? "Unlocked" : "Unlock"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-bold text-gray-400">
                  Page {currentPage} / {totalPages}
                </span>

                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="text-4xl mb-4">
              {activeTab === "photos" ? "📷" : "🎬"}
            </div>
            <p className="text-lg font-medium text-gray-400">
              No {activeTab} yet
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          isOpen={true}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default Shop;
