import WebSocket from "ws";
import axios from "axios";

const prices = {
  BTC: 0,
  ETH: 0,
  SOL: 0,
  BNB: 0,
  XRP: 0,
  USDT: 1,
};

const symbolMap = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  SOLUSDT: "SOL",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
};

// ============================
// STORE PRICES FROM EXCHANGES
// ============================
const sources = {
  binance: {},
  okx: {},
  kucoin: {},
};

// ============================
// UPDATE FINAL PRICE (AVG)
// ============================
function updateFinalPrices() {
  for (const key in symbolMap) {
    const asset = symbolMap[key];

    const vals = [
      sources.binance[asset],
      sources.okx[asset],
      sources.kucoin[asset],
    ].filter(Boolean);

    if (vals.length > 0) {
      prices[asset] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }
}

// ============================
// BINANCE WS
// ============================
function binanceWS() {
  try {
    const streams = Object.keys(symbolMap)
      .map((s) => `${s.toLowerCase()}@trade`)
      .join("/");

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    );

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);
        const t = msg.data;
        if (!t) return;

        const asset = symbolMap[t.s];
        if (asset) {
          sources.binance[asset] = parseFloat(t.p);
          updateFinalPrices();
        }
      } catch {}
    });

    ws.on("error", () => {});
    ws.on("close", () => setTimeout(binanceWS, 3000));
  } catch {
    setTimeout(binanceWS, 3000);
  }
}

// ============================
// OKX REST POLLING
// ============================
async function okxLoop() {
  try {
    const res = await axios.get(
      "https://www.okx.com/api/v5/market/tickers?instType=SPOT"
    );

    res.data.data.forEach((item) => {
      const inst = item.instId;

      if (inst === "BTC-USDT")
        sources.okx["BTC"] = parseFloat(item.last);
      if (inst === "ETH-USDT")
        sources.okx["ETH"] = parseFloat(item.last);
      if (inst === "SOL-USDT")
        sources.okx["SOL"] = parseFloat(item.last);
      if (inst === "BNB-USDT")
        sources.okx["BNB"] = parseFloat(item.last);
      if (inst === "XRP-USDT")
        sources.okx["XRP"] = parseFloat(item.last);
    });

    updateFinalPrices();
  } catch {}

  setTimeout(okxLoop, 5000);
}

// ============================
// KUCOIN REST
// ============================
async function kucoinLoop() {
  try {
    const res = await axios.get(
      "https://api.kucoin.com/api/v1/market/allTickers"
    );

    res.data.data.ticker.forEach((t) => {
      const sym = t.symbol;

      if (sym === "BTC-USDT")
        sources.kucoin["BTC"] = parseFloat(t.last);
      if (sym === "ETH-USDT")
        sources.kucoin["ETH"] = parseFloat(t.last);
      if (sym === "SOL-USDT")
        sources.kucoin["SOL"] = parseFloat(t.last);
      if (sym === "BNB-USDT")
        sources.kucoin["BNB"] = parseFloat(t.last);
      if (sym === "XRP-USDT")
        sources.kucoin["XRP"] = parseFloat(t.last);
    });

    updateFinalPrices();
  } catch {}

  setTimeout(kucoinLoop, 5000);
}

// ============================
// START SYSTEM
// ============================
binanceWS();
okxLoop();
kucoinLoop();

// ============================
// EXPORT
// ============================
export function getPrices() {
  return prices;
}

export function isPriceReady() {
  return prices.BTC > 0 && prices.ETH > 0;
}
