import { Router } from "express";
import { supabaseAdmin } from "@services/supabase";

const router = Router();

// GET /api/shops/:slug
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return res.status(500).json({ ok: false, error: "DB_READ_ERROR" });
  if (!data) return res.status(404).json({ ok: false, error: "SHOP_NOT_FOUND" });

  res.json({ ok: true, shop: data });
});

export default router;
