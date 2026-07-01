"use server";

import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import fs from "fs/promises";
import path from "path";

interface TradeData {
  id: number;
  type: "BUY" | "SELL";
  quantity: string;
  rate: string;
  fee: string;
  createdAt: string;
}

interface ArchiveEntry {
  month: string;
  year: number;
  revenue: string;
}

interface DataStore {
  trades: TradeData[];
  archive: ArchiveEntry[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dataFilePath = path.join(process.cwd(), "db/data.json");

async function readDataRaw(): Promise<DataStore> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(fileContent);
    
    if (Array.isArray(parsed)) {
      return {
        trades: parsed,
        archive: []
      };
    }
    
    return {
      trades: parsed.trades || [],
      archive: parsed.archive || []
    };
  } catch (error) {
    return {
      trades: [],
      archive: []
    };
  }
}

async function writeDataRaw(data: DataStore): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

function formatTND(d: Decimal): string {
  const fixed = d.toFixed(3);
  const [intPart, decPart] = fixed.split(".");
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withSeparators}.${decPart}`;
}

function formatUSDT(d: Decimal): string {
  const fixed = d.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withSeparators}.${decPart}`;
}

async function checkAndArchive() {
  const data = await readDataRaw();
  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();

  const pastTrades = data.trades.filter((trade) => {
    const tradeDate = new Date(trade.createdAt);
    const tradeMonth = tradeDate.getMonth();
    const tradeYear = tradeDate.getFullYear();
    
    return tradeYear < currentYear || (tradeYear === currentYear && tradeMonth < currentMonthNum);
  });

  if (pastTrades.length === 0) {
    return;
  }

  const groups: { [key: string]: TradeData[] } = {};
  for (const trade of pastTrades) {
    const tradeDate = new Date(trade.createdAt);
    const m = tradeDate.getMonth();
    const y = tradeDate.getFullYear();
    const key = `${y}-${m}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(trade);
  }

  let modified = false;

  for (const key of Object.keys(groups)) {
    const [yearStr, monthStr] = key.split("-");
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const monthName = MONTH_NAMES[m];

    const alreadyArchived = data.archive.some(
      (entry) => entry.month === monthName && entry.year === y
    );

    if (!alreadyArchived) {
      const tradesInGroup = groups[key];
      let totalBuyQuantity = new Decimal(0);
      let totalBuyCost = new Decimal(0);
      let totalSellQuantity = new Decimal(0);
      let totalSellRevenue = new Decimal(0);

      for (const trade of tradesInGroup) {
        const qty = new Decimal(trade.quantity);
        const rt = new Decimal(trade.rate);
        const f = new Decimal(trade.fee ?? "0");
        const total = qty.mul(rt);

        if (trade.type === "BUY") {
          totalBuyQuantity = totalBuyQuantity.add(qty);
          totalBuyCost = totalBuyCost.add(total.add(f));
        } else {
          totalSellQuantity = totalSellQuantity.add(qty);
          totalSellRevenue = totalSellRevenue.add(total.sub(f));
        }
      }

      const avgBuyPrice = totalBuyQuantity.gt(0) 
        ? totalBuyCost.div(totalBuyQuantity) 
        : new Decimal(0);

      const avgSellPrice = totalSellQuantity.gt(0) 
        ? totalSellRevenue.div(totalSellQuantity) 
        : new Decimal(0);

      const netProfit = totalSellQuantity.mul(avgSellPrice.sub(avgBuyPrice));

      data.archive.push({
        month: monthName,
        year: y,
        revenue: formatTND(netProfit)
      });
      modified = true;
    }
  }

  data.trades = data.trades.filter((trade) => {
    const tradeDate = new Date(trade.createdAt);
    const tradeMonth = tradeDate.getMonth();
    const tradeYear = tradeDate.getFullYear();
    return !(tradeYear < currentYear || (tradeYear === currentYear && tradeMonth < currentMonthNum));
  });
  modified = true;

  if (modified) {
    data.archive.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return MONTH_NAMES.indexOf(b.month) - MONTH_NAMES.indexOf(a.month);
    });

    await writeDataRaw(data);
  }
}

export async function addTrade(formData: FormData) {
  await checkAndArchive();
  const type = (formData.get("type") as string)?.toUpperCase();
  const quantity = formData.get("quantity") as string;
  const rate = formData.get("rate") as string;
  const fee = (formData.get("fee") as string) || "0";

  if (type !== "BUY" && type !== "SELL") {
    throw new Error("Invalid trade type. Must be BUY or SELL.");
  }

  const qty = new Decimal(quantity || "0");
  const rt = new Decimal(rate || "0");
  const f = new Decimal(fee);

  if (qty.lte(0)) {
    throw new Error("Quantity must be greater than 0.");
  }
  if (rt.lte(0)) {
    throw new Error("Rate must be greater than 0.");
  }
  if (f.lt(0)) {
    throw new Error("Fee cannot be negative.");
  }

  const data = await readDataRaw();
  const newId = data.trades.length > 0 ? Math.max(...data.trades.map((t) => t.id)) + 1 : 1;

  const newTrade: TradeData = {
    id: newId,
    type: type as "BUY" | "SELL",
    quantity: qty.toFixed(8),
    rate: rt.toFixed(4),
    fee: f.toFixed(4),
    createdAt: new Date().toISOString(),
  };

  data.trades.push(newTrade);
  await writeDataRaw(data);

  revalidatePath("/");
}

export async function deleteTrade(id: number) {
  await checkAndArchive();
  const data = await readDataRaw();
  data.trades = data.trades.filter((t) => t.id !== id);
  await writeDataRaw(data);

  revalidatePath("/");
}

export async function getDashboardData() {
  await checkAndArchive();
  const data = await readDataRaw();

  let totalBuyQuantity = new Decimal(0);
  let totalBuyCost = new Decimal(0);
  
  let totalSellQuantity = new Decimal(0);
  let totalSellRevenue = new Decimal(0);

  const formattedTrades = data.trades.map((trade) => {
    const qty = new Decimal(trade.quantity);
    const rt = new Decimal(trade.rate);
    const f = new Decimal(trade.fee ?? "0");
    const total = qty.mul(rt);

    if (trade.type === "BUY") {
      totalBuyQuantity = totalBuyQuantity.add(qty);
      totalBuyCost = totalBuyCost.add(total.add(f));
    } else {
      totalSellQuantity = totalSellQuantity.add(qty);
      totalSellRevenue = totalSellRevenue.add(total.sub(f));
    }

    return {
      id: trade.id,
      type: trade.type,
      quantity: formatUSDT(qty),
      rate: formatTND(rt),
      fee: formatTND(f),
      total: formatTND(total),
      createdAt: trade.createdAt,
    };
  });

  const avgBuyPrice = totalBuyQuantity.gt(0) 
    ? totalBuyCost.div(totalBuyQuantity) 
    : new Decimal(0);

  const avgSellPrice = totalSellQuantity.gt(0) 
    ? totalSellRevenue.div(totalSellQuantity) 
    : new Decimal(0);

  const netProfit = totalSellQuantity.mul(avgSellPrice.sub(avgBuyPrice));

  const now = new Date();
  const currentMonthName = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  // Daily Earnings calculation
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const todayBuyTrades = data.trades.filter((trade) => {
    return trade.type === "BUY" && isSameDay(new Date(trade.createdAt), now);
  });

  // Find the latest selling rate in the system (could be from any trade in data.trades)
  let latestSellRate = new Decimal(0);
  const sellTrades = data.trades
    .filter(t => t.type === "SELL")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sellTrades.length > 0) {
    latestSellRate = new Decimal(sellTrades[0].rate);
  }

  const totalUsdtPurchasedToday = todayBuyTrades.reduce((acc, t) => acc.add(new Decimal(t.quantity)), new Decimal(0));

  const totalPurchaseValueToday = todayBuyTrades.reduce((acc, t) => {
    const qty = new Decimal(t.quantity);
    const rate = new Decimal(t.rate);
    return acc.add(qty.mul(rate));
  }, new Decimal(0));

  const valueAtLatestSellRate = totalUsdtPurchasedToday.mul(latestSellRate);
  
  // Daily Earnings = (Total USDT purchased today * Latest Sell Rate) - Purchase Cost
  const dailyEarnings = valueAtLatestSellRate.sub(totalPurchaseValueToday);

  return {
    trades: formattedTrades,
    avgBuyPrice: formatTND(avgBuyPrice),
    avgSellPrice: formatTND(avgSellPrice),
    totalUsdtSold: formatUSDT(totalSellQuantity),
    totalUsdtBought: formatUSDT(totalBuyQuantity),
    netProfit: formatTND(netProfit),
    totalTrades: data.trades.length,
    currentMonth: currentMonthName,
    currentYear: currentYear,
    archive: data.archive,
    
    // Today's metrics
    dailyEarnings: formatTND(dailyEarnings),
    todayDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    latestSellRate: formatTND(latestSellRate),
    totalUsdtPurchasedToday: formatUSDT(totalUsdtPurchasedToday),
    totalPurchaseValueToday: formatTND(totalPurchaseValueToday)
  };
}
