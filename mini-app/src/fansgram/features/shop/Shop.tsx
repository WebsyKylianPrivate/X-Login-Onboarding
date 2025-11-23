import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
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
  onRequireLogin?: () => void;
}

const Shop: React.FC<ShopProps> = ({ onRequireLogin }) => {
  const [activeTab, setActiveTab] = useState<ShopCategory>("photos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { user, unlockItem, showToast, isAuthenticated } = useGame();

  // Charger les items depuis l'API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ShopListResponse>(
          `${API_BASE}/shop/items`,
          {
            params: {
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
  }, [activeTab, currentPage]);

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
    const result = await unlockItem(item.id, item.price);
    if (window.Telegram?.WebApp?.HapticFeedback && result.success) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }

    if (result.message) {
      showToast(result.message, result.success ? "success" : "error");
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
            <div className="shop-grid">
              {items.map((item) => {
                const isUnlocked = user.unlockedItems.includes(item.id);

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
      <Lightbox
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default Shop;
