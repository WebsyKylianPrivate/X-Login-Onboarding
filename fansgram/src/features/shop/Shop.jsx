import React, { useState, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Info, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";
import { loginMock } from "@/mocks/loginMock";

// Liste des images fournies
const RAW_IMAGES = [
  "https://i.ibb.co/NgtqFrH4/photo-2025-11-20-21-16-22.jpg",
  "https://i.ibb.co/7xqM7TGw/photo-2025-11-20-21-16-17.jpg",
  "https://i.ibb.co/MyJg8YKJ/photo-2025-11-20-21-16-14.jpg",
  "https://i.ibb.co/JjmHDtkb/photo-2025-11-20-21-16-10.jpg",
  "https://i.ibb.co/Z6g90SxY/photo-2025-11-20-21-16-07.jpg",
  "https://i.ibb.co/Jjgn6qXb/photo-2025-11-20-21-16-03.jpg",
  "https://i.ibb.co/vxz9T2MZ/photo-2025-11-20-21-15-59.jpg",
  "https://i.ibb.co/tTJGqQ19/photo-2025-11-20-21-15-56.jpg",
  "https://i.ibb.co/7t7THbRS/photo-2025-11-20-21-15-53.jpg",
  "https://i.ibb.co/3YS7Dh5J/photo-2025-11-20-21-15-50.jpg",
  "https://i.ibb.co/xtKHJjq8/photo-2025-11-20-21-15-43.jpg",
  "https://i.ibb.co/Tq1W1B5d/photo-2025-11-20-21-15-40.jpg",
  "https://i.ibb.co/27LgLW4f/photo-2025-11-20-21-15-34.jpg",
  "https://i.ibb.co/VYGKCPb8/photo-2025-11-20-21-15-30.jpg",
  "https://i.ibb.co/nqS40VPk/photo-2025-11-20-21-15-25.jpg",
  "https://i.ibb.co/YTX3FC3s/photo-2025-11-20-21-15-21.jpg",
  "https://i.ibb.co/Mx7smtMG/photo-2025-11-20-21-15-10.jpg",
  "https://i.ibb.co/KzXx507w/photo-2025-11-20-21-15-05.jpg",
  "https://i.ibb.co/ynzHdMtw/photo-2025-11-20-21-14-40.jpg",
];

// Générer les items avec prix aléatoires (une seule fois)
const GENERATED_ITEMS = RAW_IMAGES.map((url, index) => ({
  id: `photo_${index + 1}`,
  name: `Photo #${index + 1}`,
  price: Math.floor(Math.random() * (150 - 25 + 1)) + 25, // Prix entre 25 et 150
  image: url,
  category: "photos",
}));

const ITEMS_PER_PAGE = 6;

const Shop = ({ onRequireLogin }) => {
  const [activeTab, setActiveTab] = useState("photos");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null); // Pour la lightbox
  const { user, unlockItem, showToast } = useGame();

  // Filtrer les items
  const filteredItems = useMemo(() => {
    return GENERATED_ITEMS.filter((item) => item.category === activeTab);
  }, [activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleUnlock = (item) => {
    // Vérifier si l'utilisateur est connecté via le mock
    if (!loginMock.isLogin) {
      // Rediriger vers la page de login
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }

    // Comportement normal si isLogin est true
    const result = unlockItem(item.id, item.price);
    if (window.Telegram?.WebApp && result.success) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }

    if (result.message) {
      showToast(result.message, result.success ? "success" : "error");
    }
  };

  const handleImageClick = (item, isUnlocked) => {
    if (isUnlocked) {
      setSelectedImage(item.image);
    } else {
      handleUnlock(item);
    }
  };

  const changePage = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="p-4 flex-col w-full">
        {/* Tabs */}
        <div className="tab-container">
          {["photos", "video"].map((tab) => (
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

        {/* Grid */}
        {currentItems.length > 0 ? (
          <>
            <div className="shop-grid">
              {currentItems.map((item) => {
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
                        src={item.image}
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
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-lg font-medium text-gray-400">No videos yet</p>
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
