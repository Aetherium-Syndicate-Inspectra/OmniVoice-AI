import fs from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "../config/env.js";

const dataPath = path.join(projectRoot, "data", "sample-orders.json");

async function readOrders() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

function cleanPhone(value = "") {
  return String(value).replace(/\D/g, "");
}

export const orderService = {
  async lookup({ orderNumber = "", phone = "" }) {
    const orders = await readOrders();
    return (
      orders.find((order) => order.orderNumber.toLowerCase() === String(orderNumber).toLowerCase()) ||
      orders.find((order) => cleanPhone(order.phone) === cleanPhone(phone)) ||
      null
    );
  },
};
