export interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  newsQueries: string[];
  newsQueriesKr: string[];
  stocks: ThemeStock[];
}

export interface ThemeStock {
  ticker: string;
  name: string;
  nameKr: string;
  sector: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "semiconductor",
    name: "반도체/OSAT",
    icon: "CPU",
    color: "blue",
    description: "OSAT 패키징, 파운드리, 장비, 소재",
    newsQueries: ["OSAT semiconductor packaging", "advanced packaging CoWoS HBM", "semiconductor equipment ASML"],
    newsQueriesKr: ["반도체 패키징 OSAT", "HBM 반도체", "반도체 장비 소부장"],
    stocks: [
      { ticker: "ASX", name: "ASE Technology", nameKr: "ASE 테크놀로지", sector: "OSAT" },
      { ticker: "AMKR", name: "Amkor Technology", nameKr: "앰코 테크놀로지", sector: "OSAT" },
      { ticker: "TSM", name: "TSMC", nameKr: "TSMC", sector: "Foundry" },
      { ticker: "NVDA", name: "NVIDIA", nameKr: "엔비디아", sector: "Fabless" },
      { ticker: "AMD", name: "AMD", nameKr: "AMD", sector: "Fabless" },
      { ticker: "AVGO", name: "Broadcom", nameKr: "브로드컴", sector: "Fabless" },
      { ticker: "AMAT", name: "Applied Materials", nameKr: "어플라이드", sector: "Equipment" },
      { ticker: "LRCX", name: "Lam Research", nameKr: "램리서치", sector: "Equipment" },
      { ticker: "KLAC", name: "KLA Corporation", nameKr: "KLA", sector: "Equipment" },
      { ticker: "MU", name: "Micron Technology", nameKr: "마이크론", sector: "Memory" },
      { ticker: "005930.KS", name: "Samsung Electronics", nameKr: "삼성전자", sector: "IDM" },
      { ticker: "000660.KS", name: "SK Hynix", nameKr: "SK하이닉스", sector: "Memory" },
      { ticker: "042700.KS", name: "Hanmi Semiconductor", nameKr: "한미반도체", sector: "Equipment" },
      { ticker: "058470.KS", name: "LEENO Industrial", nameKr: "리노공업", sector: "Parts" },
    ],
  },
  {
    id: "ai-robot",
    name: "AI/로봇",
    icon: "Bot",
    color: "purple",
    description: "인공지능, 자율주행, 로봇, 클라우드",
    newsQueries: ["artificial intelligence stocks", "AI robotics investment", "autonomous driving technology"],
    newsQueriesKr: ["AI 인공지능 주식", "로봇 자율주행 투자", "클라우드 AI 기업"],
    stocks: [
      { ticker: "NVDA", name: "NVIDIA", nameKr: "엔비디아", sector: "AI Chip" },
      { ticker: "MSFT", name: "Microsoft", nameKr: "마이크로소프트", sector: "AI Cloud" },
      { ticker: "GOOGL", name: "Alphabet", nameKr: "알파벳", sector: "AI Cloud" },
      { ticker: "META", name: "Meta Platforms", nameKr: "메타", sector: "AI" },
      { ticker: "PLTR", name: "Palantir", nameKr: "팔란티어", sector: "AI Software" },
      { ticker: "PATH", name: "UiPath", nameKr: "유아이패스", sector: "RPA" },
      { ticker: "ISRG", name: "Intuitive Surgical", nameKr: "인튜이티브", sector: "Robot" },
      { ticker: "TER", name: "Teradyne", nameKr: "테라다인", sector: "Robot" },
      { ticker: "039030.KQ", name: "IOTRUST", nameKr: "이오테크닉스", sector: "AI" },
      { ticker: "078340.KS", name: "COM2US", nameKr: "컴투스", sector: "AI" },
      { ticker: "454910.KS", name: "Rainbow Robotics", nameKr: "레인보우로보틱스", sector: "Robot" },
      { ticker: "272210.KS", name: "Hanwha Vision", nameKr: "한화비전", sector: "AI Vision" },
    ],
  },
  {
    id: "battery-ev",
    name: "2차전지/EV",
    icon: "Battery",
    color: "green",
    description: "배터리, 전기차, 충전 인프라, 소재",
    newsQueries: ["electric vehicle battery stocks", "EV battery investment", "lithium battery technology"],
    newsQueriesKr: ["2차전지 배터리 주식", "전기차 투자", "양극재 음극재 전해질"],
    stocks: [
      { ticker: "TSLA", name: "Tesla", nameKr: "테슬라", sector: "EV" },
      { ticker: "RIVN", name: "Rivian", nameKr: "리비안", sector: "EV" },
      { ticker: "LI", name: "Li Auto", nameKr: "리오토", sector: "EV" },
      { ticker: "ALB", name: "Albemarle", nameKr: "앨버말", sector: "Lithium" },
      { ticker: "PANW", name: "Panasonic Holdings", nameKr: "파나소닉", sector: "Battery" },
      { ticker: "QS", name: "QuantumScape", nameKr: "퀀텀스케이프", sector: "Solid State" },
      { ticker: "CHPT", name: "ChargePoint", nameKr: "차지포인트", sector: "Charging" },
      { ticker: "373220.KS", name: "LG Energy Solution", nameKr: "LG에너지솔루션", sector: "Battery" },
      { ticker: "006400.KS", name: "Samsung SDI", nameKr: "삼성SDI", sector: "Battery" },
      { ticker: "051910.KS", name: "LG Chem", nameKr: "LG화학", sector: "Materials" },
      { ticker: "247540.KS", name: "Ecopro BM", nameKr: "에코프로비엠", sector: "Cathode" },
      { ticker: "086520.KS", name: "Ecopro", nameKr: "에코프로", sector: "Cathode" },
      { ticker: "003670.KS", name: "POSCO Future M", nameKr: "포스코퓨처엠", sector: "Materials" },
    ],
  },
  {
    id: "bio-health",
    name: "바이오/헬스케어",
    icon: "Heart",
    color: "pink",
    description: "신약개발, 의료기기, 디지털헬스, 진단",
    newsQueries: ["biotech pharma stocks", "healthcare innovation investment", "FDA drug approval"],
    newsQueriesKr: ["바이오 신약 주식", "헬스케어 의료기기", "임상시험 FDA 승인"],
    stocks: [
      { ticker: "LLY", name: "Eli Lilly", nameKr: "일라이릴리", sector: "Pharma" },
      { ticker: "NVO", name: "Novo Nordisk", nameKr: "노보노디스크", sector: "Pharma" },
      { ticker: "ABBV", name: "AbbVie", nameKr: "애브비", sector: "Pharma" },
      { ticker: "TMO", name: "Thermo Fisher", nameKr: "써모피셔", sector: "Equipment" },
      { ticker: "VRTX", name: "Vertex Pharma", nameKr: "버텍스", sector: "Biotech" },
      { ticker: "REGN", name: "Regeneron", nameKr: "리제네론", sector: "Biotech" },
      { ticker: "DXCM", name: "DexCom", nameKr: "덱스콤", sector: "MedTech" },
      { ticker: "207940.KS", name: "Samsung Biologics", nameKr: "삼성바이오로직스", sector: "CDMO" },
      { ticker: "068270.KS", name: "Celltrion", nameKr: "셀트리온", sector: "Biosimilar" },
      { ticker: "326030.KS", name: "SK Biopharm", nameKr: "SK바이오팜", sector: "CNS" },
      { ticker: "145020.KS", name: "Hugel", nameKr: "휴젤", sector: "Aesthetics" },
      { ticker: "950160.KS", name: "Alteogen", nameKr: "알테오젠", sector: "Platform" },
    ],
  },
  {
    id: "defense",
    name: "방산/우주항공",
    icon: "Shield",
    color: "orange",
    description: "방위산업, 우주항공, 드론, 사이버보안",
    newsQueries: ["defense stocks aerospace", "space industry investment", "military drone technology"],
    newsQueriesKr: ["방산 주식 투자", "우주항공 방위산업", "드론 사이버보안"],
    stocks: [
      { ticker: "LMT", name: "Lockheed Martin", nameKr: "록히드마틴", sector: "Defense" },
      { ticker: "RTX", name: "RTX Corporation", nameKr: "RTX", sector: "Defense" },
      { ticker: "NOC", name: "Northrop Grumman", nameKr: "노스롭그루먼", sector: "Defense" },
      { ticker: "GD", name: "General Dynamics", nameKr: "제너럴다이나믹스", sector: "Defense" },
      { ticker: "BA", name: "Boeing", nameKr: "보잉", sector: "Aerospace" },
      { ticker: "RKLB", name: "Rocket Lab", nameKr: "로켓랩", sector: "Space" },
      { ticker: "ASTS", name: "AST SpaceMobile", nameKr: "AST스페이스모바일", sector: "Space" },
      { ticker: "CRWD", name: "CrowdStrike", nameKr: "크라우드스트라이크", sector: "Cyber" },
      { ticker: "012450.KS", name: "Hanwha Aerospace", nameKr: "한화에어로스페이스", sector: "Defense" },
      { ticker: "047810.KS", name: "Korea Aerospace", nameKr: "한국항공우주", sector: "Aerospace" },
      { ticker: "003570.KS", name: "SNT Dynamics", nameKr: "SNT다이나믹스", sector: "Defense" },
      { ticker: "014970.KS", name: "Hanon Systems", nameKr: "LIG넥스원", sector: "Defense" },
    ],
  },
  {
    id: "energy",
    name: "에너지/원자력",
    icon: "Zap",
    color: "yellow",
    description: "원자력, 신재생에너지, 수소, 전력망",
    newsQueries: ["nuclear energy stocks", "renewable energy investment", "hydrogen fuel cell"],
    newsQueriesKr: ["원자력 SMR 주식", "신재생에너지 태양광", "수소 에너지 투자"],
    stocks: [
      { ticker: "CEG", name: "Constellation Energy", nameKr: "컨스텔레이션", sector: "Nuclear" },
      { ticker: "VST", name: "Vistra", nameKr: "비스트라", sector: "Power" },
      { ticker: "CCJ", name: "Cameco", nameKr: "카메코", sector: "Uranium" },
      { ticker: "SMR", name: "NuScale Power", nameKr: "뉴스케일", sector: "SMR" },
      { ticker: "ENPH", name: "Enphase Energy", nameKr: "엔페이즈", sector: "Solar" },
      { ticker: "FSLR", name: "First Solar", nameKr: "퍼스트솔라", sector: "Solar" },
      { ticker: "PLUG", name: "Plug Power", nameKr: "플러그파워", sector: "Hydrogen" },
      { ticker: "BE", name: "Bloom Energy", nameKr: "블룸에너지", sector: "Fuel Cell" },
      { ticker: "034020.KS", name: "Doosan Enerbility", nameKr: "두산에너빌리티", sector: "Nuclear" },
      { ticker: "009830.KS", name: "Hanwha Solutions", nameKr: "한화솔루션", sector: "Solar" },
      { ticker: "267260.KS", name: "HD Hyundai Electric", nameKr: "HD현대일렉트릭", sector: "Grid" },
      { ticker: "336260.KS", name: "Doosan Fuel Cell", nameKr: "두산퓨얼셀", sector: "Fuel Cell" },
    ],
  },
];

export function getTheme(id: string): ThemeConfig | undefined {
  return THEMES.find((t) => t.id === id);
}

export const THEME_COLORS: Record<string, { bg: string; border: string; text: string; bgLight: string }> = {
  blue: { bg: "bg-blue-500", border: "border-blue-500/30", text: "text-blue-400", bgLight: "bg-blue-500/10" },
  purple: { bg: "bg-purple-500", border: "border-purple-500/30", text: "text-purple-400", bgLight: "bg-purple-500/10" },
  green: { bg: "bg-green-500", border: "border-green-500/30", text: "text-green-400", bgLight: "bg-green-500/10" },
  pink: { bg: "bg-pink-500", border: "border-pink-500/30", text: "text-pink-400", bgLight: "bg-pink-500/10" },
  orange: { bg: "bg-orange-500", border: "border-orange-500/30", text: "text-orange-400", bgLight: "bg-orange-500/10" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-500/30", text: "text-yellow-400", bgLight: "bg-yellow-500/10" },
};
