// 주요 한국 주식 종목 DB (한글명 검색용)
export interface KrStockEntry {
  code: string;
  name: string;
  market: "KS" | "KQ";
}

export const KR_STOCKS: KrStockEntry[] = [
  // KOSPI 대형주
  { code: "005930", name: "삼성전자", market: "KS" },
  { code: "000660", name: "SK하이닉스", market: "KS" },
  { code: "373220", name: "LG에너지솔루션", market: "KS" },
  { code: "207940", name: "삼성바이오로직스", market: "KS" },
  { code: "005490", name: "POSCO홀딩스", market: "KS" },
  { code: "006400", name: "삼성SDI", market: "KS" },
  { code: "035420", name: "NAVER", market: "KS" },
  { code: "005380", name: "현대차", market: "KS" },
  { code: "000270", name: "기아", market: "KS" },
  { code: "035720", name: "카카오", market: "KS" },
  { code: "051910", name: "LG화학", market: "KS" },
  { code: "068270", name: "셀트리온", market: "KS" },
  { code: "105560", name: "KB금융", market: "KS" },
  { code: "055550", name: "신한지주", market: "KS" },
  { code: "003670", name: "포스코퓨처엠", market: "KS" },
  { code: "012330", name: "현대모비스", market: "KS" },
  { code: "028260", name: "삼성물산", market: "KS" },
  { code: "066570", name: "LG전자", market: "KS" },
  { code: "003550", name: "LG", market: "KS" },
  { code: "034730", name: "SK", market: "KS" },
  { code: "032830", name: "삼성생명", market: "KS" },
  { code: "010130", name: "고려아연", market: "KS" },
  { code: "323410", name: "카카오뱅크", market: "KS" },
  { code: "259960", name: "크래프톤", market: "KS" },
  { code: "352820", name: "하이브", market: "KS" },
  // 반도체/장비
  { code: "042700", name: "한미반도체", market: "KS" },
  { code: "058470", name: "리노공업", market: "KS" },
  { code: "166090", name: "하나머티리얼즈", market: "KS" },
  { code: "036930", name: "주성엔지니어링", market: "KS" },
  { code: "403870", name: "HPSP", market: "KS" },
  { code: "005935", name: "삼성전자우", market: "KS" },
  { code: "267260", name: "HD현대일렉트릭", market: "KS" },
  // 2차전지
  { code: "247540", name: "에코프로비엠", market: "KS" },
  { code: "086520", name: "에코프로", market: "KS" },
  { code: "011790", name: "SKC", market: "KS" },
  // 바이오
  { code: "326030", name: "SK바이오팜", market: "KS" },
  { code: "145020", name: "휴젤", market: "KS" },
  { code: "950160", name: "알테오젠", market: "KS" },
  { code: "302440", name: "SK바이오사이언스", market: "KS" },
  // 방산/조선
  { code: "012450", name: "한화에어로스페이스", market: "KS" },
  { code: "047810", name: "한국항공우주", market: "KS" },
  { code: "003570", name: "SNT다이나믹스", market: "KS" },
  { code: "329180", name: "HD현대중공업", market: "KS" },
  { code: "010620", name: "현대미포조선", market: "KS" },
  { code: "009540", name: "HD한국조선해양", market: "KS" },
  // 에너지
  { code: "034020", name: "두산에너빌리티", market: "KS" },
  { code: "009830", name: "한화솔루션", market: "KS" },
  { code: "336260", name: "두산퓨얼셀", market: "KS" },
  // 기타 대형
  { code: "018260", name: "삼성에스디에스", market: "KS" },
  { code: "017670", name: "SK텔레콤", market: "KS" },
  { code: "030200", name: "KT", market: "KS" },
  { code: "036570", name: "엔씨소프트", market: "KS" },
  { code: "251270", name: "넷마블", market: "KS" },
  // KOSDAQ
  { code: "217190", name: "제너셈", market: "KQ" },
  { code: "404950", name: "에이팩트", market: "KQ" },
  { code: "357780", name: "솔브레인", market: "KQ" },
  { code: "095340", name: "ISC", market: "KQ" },
  { code: "039030", name: "이오테크닉스", market: "KQ" },
  { code: "293490", name: "카카오게임즈", market: "KQ" },
  { code: "263750", name: "펄어비스", market: "KQ" },
  { code: "196170", name: "알테오젠", market: "KQ" },
  { code: "141080", name: "레고켐바이오", market: "KQ" },
  { code: "112040", name: "위메이드", market: "KQ" },
  { code: "454910", name: "레인보우로보틱스", market: "KQ" },
  { code: "272210", name: "한화비전", market: "KQ" },
  { code: "086900", name: "메디톡스", market: "KQ" },
  { code: "328130", name: "루닛", market: "KQ" },
  { code: "322310", name: "오로스테크놀로지", market: "KQ" },
  { code: "067310", name: "하나마이크론", market: "KQ" },
  { code: "131970", name: "테스나", market: "KQ" },
  { code: "240810", name: "원익IPS", market: "KQ" },
  { code: "298380", name: "에이비엘바이오", market: "KQ" },
  { code: "060310", name: "3S", market: "KQ" },
];

export function searchKrStocks(query: string): KrStockEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return KR_STOCKS.filter(
    (s) => s.name.toLowerCase().includes(q) || s.code.includes(q)
  ).slice(0, 10);
}
