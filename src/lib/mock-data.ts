import { OsatNews, StockAnalysis, MarketOverview, PriceHistory } from "./types";

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

export const osatCompanies = [
  { ticker: "ASX", name: "ASE Technology", nameKr: "ASE 테크놀로지", sector: "OSAT" },
  { ticker: "AMKR", name: "Amkor Technology", nameKr: "앰코 테크놀로지", sector: "OSAT" },
  { ticker: "JECT", name: "JCET Group", nameKr: "JCET 그룹", sector: "OSAT" },
  { ticker: "TFII", name: "Tongfu Microelectronics", nameKr: "통푸 마이크로", sector: "OSAT" },
  { ticker: "KYEC", name: "King Yuan Electronics", nameKr: "킹위안 전자", sector: "OSAT/Test" },
  { ticker: "SPIL", name: "Siliconware Precision", nameKr: "실리콘웨어", sector: "OSAT" },
  { ticker: "UTAC", name: "UTAC Holdings", nameKr: "UTAC 홀딩스", sector: "OSAT" },
  { ticker: "PTI", name: "Powertech Technology", nameKr: "파워텍 테크놀로지", sector: "OSAT" },
  { ticker: "TSM", name: "TSMC", nameKr: "TSMC", sector: "Foundry" },
  { ticker: "INTC", name: "Intel", nameKr: "인텔", sector: "IDM" },
  { ticker: "NVDA", name: "NVIDIA", nameKr: "엔비디아", sector: "Fabless" },
  { ticker: "AMD", name: "AMD", nameKr: "AMD", sector: "Fabless" },
];

export function generateNews(date: string): OsatNews[] {
  const allNews: OsatNews[] = [
    {
      id: "1",
      date,
      title: "ASE Technology, 2.4nm 고급 패키징 라인 확장 발표",
      summary: "ASE Technology가 AI 칩 수요 급증에 대응하기 위해 2.4nm 고급 패키징 생산 라인을 대폭 확장한다고 발표했습니다. 투자 규모는 약 35억 달러로, 2027년 완공 예정입니다.",
      source: "Semiconductor Engineering",
      url: "#",
      category: "technology",
      sentiment: "positive",
      relatedCompanies: ["ASX", "TSM"],
    },
    {
      id: "2",
      date,
      title: "Amkor, 베트남 신규 공장 가동 개시",
      summary: "Amkor Technology의 베트남 팩토리 5가 본격 가동을 시작했습니다. 이 공장은 주로 자동차용 반도체와 IoT 디바이스 패키징을 담당하며, 연간 생산 능력 30% 증가가 예상됩니다.",
      source: "Reuters",
      url: "#",
      category: "market",
      sentiment: "positive",
      relatedCompanies: ["AMKR"],
    },
    {
      id: "3",
      date,
      title: "중국 OSAT 기업 JCET, 미국 수출 규제 영향 분석",
      summary: "미국의 대중국 반도체 수출 규제가 강화되면서 JCET Group의 고급 패키징 사업에 영향이 예상됩니다. 일부 장비 도입에 어려움이 있을 수 있으나, 국산화 전략으로 대응 중입니다.",
      source: "SCMP",
      url: "#",
      category: "policy",
      sentiment: "negative",
      relatedCompanies: ["JECT", "TFII"],
    },
    {
      id: "4",
      date,
      title: "글로벌 OSAT 시장, 2026년 480억 달러 규모 전망",
      summary: "TechInsights에 따르면 글로벌 OSAT 시장은 AI 및 HPC 수요에 힘입어 2026년 480억 달러 규모에 달할 것으로 전망됩니다. 전년 대비 12% 성장입니다.",
      source: "TechInsights",
      url: "#",
      category: "market",
      sentiment: "positive",
      relatedCompanies: ["ASX", "AMKR", "JECT"],
    },
    {
      id: "5",
      date,
      title: "NVIDIA, CoWoS 패키징 물량 확보 위해 OSAT 파트너 확대",
      summary: "NVIDIA가 차세대 GPU의 CoWoS 패키징 물량을 확보하기 위해 ASE, Amkor 등 OSAT 기업과의 협력을 확대하고 있습니다. 이는 OSAT 업계 전반에 긍정적인 영향을 미칠 전망입니다.",
      source: "DigiTimes",
      url: "#",
      category: "technology",
      sentiment: "positive",
      relatedCompanies: ["NVDA", "ASX", "AMKR"],
    },
    {
      id: "6",
      date,
      title: "King Yuan Electronics, 테스트 수요 증가로 실적 상향",
      summary: "King Yuan Electronics가 AI 가속기 및 HBM 메모리 테스트 수요 증가로 인해 Q1 실적 가이던스를 상향 조정했습니다.",
      source: "Bloomberg",
      url: "#",
      category: "earnings",
      sentiment: "positive",
      relatedCompanies: ["KYEC"],
    },
    {
      id: "7",
      date,
      title: "Powertech Technology, HBM 패키징 시장 진출 선언",
      summary: "Powertech Technology가 고대역폭 메모리(HBM) 패키징 시장에 본격 진출한다고 발표했습니다. 기존 DRAM 패키징 역량을 바탕으로 HBM3E 패키징 라인을 구축 중입니다.",
      source: "Nikkei Asia",
      url: "#",
      category: "technology",
      sentiment: "positive",
      relatedCompanies: ["PTI"],
    },
    {
      id: "8",
      date,
      title: "인텔, 파운드리 사업부 분사 검토 보도",
      summary: "인텔이 파운드리 사업부를 별도 법인으로 분사하는 방안을 검토하고 있다는 보도가 나왔습니다. 이는 OSAT 업계의 경쟁 구도에 변화를 가져올 수 있습니다.",
      source: "WSJ",
      url: "#",
      category: "merger",
      sentiment: "neutral",
      relatedCompanies: ["INTC"],
    },
  ];

  // Vary news slightly based on date hash
  const dateHash = date.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const count = 4 + (dateHash % 5);
  const shuffled = [...allNews].sort(() => (dateHash % 3) - 1);
  return shuffled.slice(0, count).map((n, i) => ({ ...n, id: `${date}-${i}` }));
}

export interface CustomCompany {
  ticker: string;
  name: string;
  nameKr: string;
  sector: string;
}

export function generateStockAnalysis(company: CustomCompany, date: string, index: number): StockAnalysis {
  const dateHash = date.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const tickerHash = company.ticker.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const s = ((dateHash * (index + 1) * 9301 + tickerHash * 49297) % 233280) / 233280;
  const basePrice = 20 + (tickerHash % 200);
  const change = (s - 0.45) * basePrice * 0.08;
  const changePercent = (change / basePrice) * 100;
  const rsi = 30 + s * 40;
  const signal: "buy" | "sell" | "hold" =
    rsi < 35 ? "buy" : rsi > 65 ? "sell" : "hold";
  const signalStrength = Math.abs(rsi - 50) * 2;

  const reasons: StockAnalysis["reasons"] = [];
  if (changePercent > 2) {
    reasons.push({
      type: "news",
      title: "호재성 뉴스 발표",
      description: `${company.name}에 대한 긍정적인 시장 뉴스가 주가를 견인하고 있습니다.`,
      impact: "positive",
    });
  }
  if (changePercent < -2) {
    reasons.push({
      type: "macro",
      title: "거시 경제 우려",
      description: "글로벌 경기 둔화 우려와 금리 인상 가능성이 반도체 섹터에 부담을 주고 있습니다.",
      impact: "negative",
    });
  }
  if (rsi < 35) {
    reasons.push({
      type: "technical",
      title: "RSI 과매도 구간 진입",
      description: `RSI가 ${rsi.toFixed(1)}로 과매도 구간에 진입하여 반등 가능성이 있습니다.`,
      impact: "positive",
    });
  }
  if (rsi > 65) {
    reasons.push({
      type: "technical",
      title: "RSI 과매수 구간 진입",
      description: `RSI가 ${rsi.toFixed(1)}로 과매수 구간으로, 조정 가능성이 있습니다.`,
      impact: "negative",
    });
  }
  reasons.push({
    type: "sector",
    title: `${company.sector} 섹터 동향`,
    description: "AI 반도체 수요 증가로 관련 섹터 전반적으로 성장세를 보이고 있습니다.",
    impact: "positive",
  });

  return {
    ticker: company.ticker,
    name: company.name,
    nameKr: company.nameKr,
    price: basePrice + change,
    change,
    changePercent,
    reasons,
    signal,
    signalStrength,
    technicals: {
      rsi,
      macd: (s - 0.5) * 2,
      ma20: basePrice * (1 + (s - 0.5) * 0.03),
      ma50: basePrice * (1 + (s - 0.5) * 0.05),
      ma200: basePrice * (1 + (s - 0.5) * 0.08),
      bollingerUpper: basePrice * 1.05,
      bollingerLower: basePrice * 0.95,
      supportLevel: basePrice * 0.93,
      resistanceLevel: basePrice * 1.07,
    },
  };
}

export function generateStockAnalyses(date: string, customCompanies?: CustomCompany[]): StockAnalysis[] {
  const companies = customCompanies || osatCompanies;
  const dateHash = date.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const seed = (n: number) => ((dateHash * (n + 1) * 9301 + 49297) % 233280) / 233280;

  return companies.map((company, i) => {
    const s = seed(i);
    const basePrice = [45, 32, 28, 15, 12, 38, 22, 18, 180, 22, 890, 165][i] || 50;
    const change = (s - 0.45) * basePrice * 0.08;
    const changePercent = (change / basePrice) * 100;
    const rsi = 30 + s * 40;
    const signal: "buy" | "sell" | "hold" =
      rsi < 35 ? "buy" : rsi > 65 ? "sell" : "hold";
    const signalStrength = Math.abs(rsi - 50) * 2;

    const reasons: StockAnalysis["reasons"] = [];
    if (changePercent > 2) {
      reasons.push({
        type: "news",
        title: "호재성 뉴스 발표",
        description: `${company.name}에 대한 긍정적인 시장 뉴스가 주가를 견인하고 있습니다.`,
        impact: "positive",
      });
    }
    if (changePercent < -2) {
      reasons.push({
        type: "macro",
        title: "거시 경제 우려",
        description: "글로벌 경기 둔화 우려와 금리 인상 가능성이 반도체 섹터에 부담을 주고 있습니다.",
        impact: "negative",
      });
    }
    if (rsi < 35) {
      reasons.push({
        type: "technical",
        title: "RSI 과매도 구간 진입",
        description: `RSI가 ${rsi.toFixed(1)}로 과매도 구간에 진입하여 반등 가능성이 있습니다.`,
        impact: "positive",
      });
    }
    if (rsi > 65) {
      reasons.push({
        type: "technical",
        title: "RSI 과매수 구간 진입",
        description: `RSI가 ${rsi.toFixed(1)}로 과매수 구간으로, 조정 가능성이 있습니다.`,
        impact: "negative",
      });
    }
    reasons.push({
      type: "sector",
      title: "OSAT 섹터 전반 동향",
      description: "AI 반도체 수요 증가로 OSAT 섹터 전반적으로 성장세를 보이고 있습니다.",
      impact: "positive",
    });

    return {
      ticker: company.ticker,
      name: company.name,
      nameKr: company.nameKr,
      price: basePrice + change,
      change,
      changePercent,
      reasons,
      signal,
      signalStrength,
      technicals: {
        rsi,
        macd: (s - 0.5) * 2,
        ma20: basePrice * (1 + (s - 0.5) * 0.03),
        ma50: basePrice * (1 + (s - 0.5) * 0.05),
        ma200: basePrice * (1 + (s - 0.5) * 0.08),
        bollingerUpper: basePrice * 1.05,
        bollingerLower: basePrice * 0.95,
        supportLevel: basePrice * 0.93,
        resistanceLevel: basePrice * 1.07,
      },
    };
  });
}

export function generateMarketOverview(date: string): MarketOverview {
  const dateHash = date.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const seed = ((dateHash * 9301 + 49297) % 233280) / 233280;

  return {
    date,
    osatIndex: 1250 + (seed - 0.5) * 100,
    osatIndexChange: (seed - 0.48) * 3,
    topMovers: [],
    sectorPerformance: [
      { sector: "OSAT", change: (seed - 0.45) * 4, volume: 2500000 + seed * 1000000 },
      { sector: "Foundry", change: (seed - 0.5) * 3, volume: 1800000 + seed * 800000 },
      { sector: "Fabless", change: (seed - 0.42) * 5, volume: 3200000 + seed * 1200000 },
      { sector: "IDM", change: (seed - 0.52) * 3.5, volume: 1200000 + seed * 600000 },
    ],
  };
}

export function generatePriceHistory(ticker: string): PriceHistory[] {
  const basePrice = { ASX: 45, AMKR: 32, JECT: 28, TFII: 15, KYEC: 12, SPIL: 38, UTAC: 22, PTI: 18, TSM: 180, INTC: 22, NVDA: 890, AMD: 165 }[ticker] || 50;

  const history: PriceHistory[] = [];
  let price = basePrice;
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const change = (Math.sin(i * 0.3) * 0.02 + (Math.random() - 0.48) * 0.03) * price;
    price += change;
    history.push({
      date: formatDate(d),
      open: price - Math.random() * 2,
      high: price + Math.random() * 3,
      low: price - Math.random() * 3,
      close: price,
      volume: Math.floor(1000000 + Math.random() * 2000000),
    });
  }
  return history;
}

export function generateOsatIndexHistory(): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = [];
  let value = 1200;
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    value += (Math.sin(i * 0.2) * 5 + (Math.random() - 0.45) * 10);
    history.push({ date: formatDate(d), value: Math.round(value * 100) / 100 });
  }
  return history;
}
