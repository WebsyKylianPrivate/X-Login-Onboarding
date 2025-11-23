import { Router } from "express";
import { supabaseAdmin } from "@services/supabase";
import { ShopItemResponse, ShopListResponse } from "../../types/shop";

const router = Router();

/**
 * GET /api/shop/items
 * Query:
 *  - category=photos|video (optional)
 *  - active=true|false (optional, default true)
 *  - page=1 (optional, default 1)
 *  - perPage=6 (optional, default 6)
 */
router.get("/items", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const active = (req.query.active as string | undefined) ?? "true";
    const page = Math.max(parseInt((req.query.page as string) ?? "1", 10), 1);
    const perPage = Math.min(
      Math.max(parseInt((req.query.perPage as string) ?? "6", 10), 1),
      50
    );

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // base query
    let q = supabaseAdmin
      .from("shop_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category) q = q.eq("category", category);
    if (active === "true") q = q.eq("is_active", true);
    if (active === "false") q = q.eq("is_active", false);

    const { data, error, count } = await q;

    if (error) {
      console.error("shop list error", error);
      return res.status(500).json({
        ok: false,
        items: [],
        page,
        perPage,
        total: 0,
        totalPages: 0,
        error: "DB_READ_ERROR",
      } as ShopListResponse);
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / perPage);

    return res.json({
      ok: true,
      items: data ?? [],
      page,
      perPage,
      total,
      totalPages,
    } as ShopListResponse);
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      items: [],
      page: 1,
      perPage: 6,
      total: 0,
      totalPages: 0,
      error: e.message,
    } as ShopListResponse);
  }
});

/**
 * GET /api/shop/items/:id
 */
router.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("shop_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("shop get error", error);
      return res.status(500).json({
        ok: false,
        error: "DB_READ_ERROR",
      } as ShopItemResponse);
    }

    return res.json({
      ok: true,
      item: data ?? null,
    } as ShopItemResponse);
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e.message,
    } as ShopItemResponse);
  }
});

/**
 * POST /api/shop/items
 * Body: { name, image_url, price, category?, is_active? }
 */
// <router.post("/items", async (req, res) => {
//   try {
//     const {
//       name,
//       image_url,
//       price,
//       category = "photos",
//       is_active = true,
//     } = req.body;

//     if (!name || !image_url || price === undefined) {
//       return res.status(400).json({
//         ok: false,
//         error: "Missing fields",
//       } as ShopItemResponse);
//     }

//     const { data, error } = await supabaseAdmin
//       .from("shop_items")
//       .insert({ name, image_url, price, category, is_active })
//       .select("*")
//       .single();

//     if (error) {
//       console.error("shop create error", error);
//       return res.status(500).json({
//         ok: false,
//         error: "DB_INSERT_ERROR",
//       } as ShopItemResponse);
//     }

//     return res.status(201).json({
//       ok: true,
//       item: data,
//     } as ShopItemResponse);
//   } catch (e: any) {
//     return res.status(500).json({
//       ok: false,
//       error: e.message,
//     } as ShopItemResponse);
//   }
// });

// /**
//  * DELETE /api/shop/items/:id
//  * Hard delete
//  */
// router.delete("/items/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { error } = await supabaseAdmin
//       .from("shop_items")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       console.error("shop delete error", error);
//       return res.status(500).json({
//         ok: false,
//         error: "DB_DELETE_ERROR",
//       } as ShopItemResponse);
//     }

//     return res.json({
//       ok: true,
//       item: null,
//     } as ShopItemResponse);
//   } catch (e: any) {
//     return res.status(500).json({
//       ok: false,
//       error: e.message,
//     } as ShopItemResponse);
//   }
// });

export default router;
