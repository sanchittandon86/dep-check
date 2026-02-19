export interface PortfolioHolding {
  symbol: string
  name: string
  quantity: number
  price: number
  value: number
  changePercent: number
}

export interface CustomerPortfolio {
  customerId: string
  customerName: string
  totalValue: number
  cashBalance: number
  investedValue: number
  dayChangePercent: number
  holdings: PortfolioHolding[]
  lastUpdated: string
}

export const mockPortfolio: CustomerPortfolio = {
  customerId: "CUST-7842",
  customerName: "Alex Morgan",
  totalValue: 124_850.42,
  cashBalance: 15_200.0,
  investedValue: 109_650.42,
  dayChangePercent: 1.24,
  lastUpdated: "2025-02-18T10:30:00Z",
  holdings: [
    { symbol: "AAPL", name: "Apple Inc.", quantity: 45, price: 189.84, value: 8542.8, changePercent: 0.92 },
    { symbol: "MSFT", name: "Microsoft Corp.", quantity: 30, price: 415.22, value: 12456.6, changePercent: 1.15 },
    { symbol: "GOOGL", name: "Alphabet Inc.", quantity: 25, price: 142.56, value: 3564.0, changePercent: -0.34 },
    { symbol: "AMZN", name: "Amazon.com Inc.", quantity: 40, price: 178.92, value: 7156.8, changePercent: 2.01 },
    { symbol: "VOO", name: "Vanguard S&P 500 ETF", quantity: 120, price: 428.15, value: 51378.0, changePercent: 0.58 },
    { symbol: "NVDA", name: "NVIDIA Corp.", quantity: 15, price: 138.24, value: 2073.6, changePercent: 3.42 },
  ],
}
