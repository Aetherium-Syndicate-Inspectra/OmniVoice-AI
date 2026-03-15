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

function tokenize(text = "") {
  return normalize(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function scoreProductMatch(product, queryTokens) {
  const haystack = [product.name, product.sku, ...(product.benefits || [])].map(normalize).join(" ");
  return queryTokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

export const catalogService = {
  async listProducts() {
    return readProducts();
  },

  async findBestMatch(query = "") {
    const products = await readProducts();
    const q = normalize(query);

    if (!q) return products[0] || null;

    const exactMatch = products.find((product) => normalize(product.name).includes(q) || normalize(product.sku).includes(q));
    if (exactMatch) return exactMatch;

    const queryTokens = tokenize(q);
    if (!queryTokens.length) return null;

    const ranked = products
      .map((product) => ({
        product,
        score: scoreProductMatch(product, queryTokens),
      }))
      .sort((a, b) => b.score - a.score);

    return ranked[0]?.score > 0 ? ranked[0].product : null;
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
