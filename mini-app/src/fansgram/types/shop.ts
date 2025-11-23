// Types pour le shop - correspondant aux types du serveur
export type ShopCategory = "photos" | "video" | string;

export interface ShopItem {
  id: string; // uuid
  name: string;
  image_url: string;
  price: number;
  category: ShopCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopListResponse {
  ok: boolean;
  items: ShopItem[];
  page: number;
  perPage: number;
  total: number; // nb total d'items (pour calcul totalPages)
  totalPages: number;
  error?: string;
}

export interface ShopItemResponse {
  ok: boolean;
  item?: ShopItem | null;
  error?: string;
}

