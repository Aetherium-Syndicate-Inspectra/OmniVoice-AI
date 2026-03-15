import fs from "node:fs/promises";
import path from "node:path";
import { projectRoot, env } from "../config/env.js";

const dataPath = path.join(projectRoot, "data", "sample-products.json");

async function readProducts() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

function normalize(text = "") {
  return text.toLowerCase().trim();
}

export const catalogService = {
  async listProducts() {
    return readProducts();
  },

  async findBestMatch(query = "") {
    const products = await readProducts();
    const q = normalize(query);

    if (!q) return products[0] || null;

    return (
      products.find((product) => normalize(product.name).includes(q) || normalize(product.sku).includes(q)) ||
      products.find((product) => product.benefits.some((benefit) => normalize(benefit).includes(q))) ||
      null
    );
  },

  async summarizeProduct(query = "") {
    const product = await this.findBestMatch(query);
    if (!product) return null;

    return {
      ...product,
      displayPrice: `${product.price} ${product.currency || env.defaultCurrency}`,
      available: product.stock > 0,
    };
  },
};
