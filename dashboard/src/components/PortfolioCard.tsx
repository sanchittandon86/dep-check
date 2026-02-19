import { ArrowUpRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockPortfolio } from "@/data/portfolio-mock"

const SYMBOL_TO_INSTRUMENT_ID: Record<string, string> = {
  AAPL: "INS001",
  MSFT: "INS002",
  GOOGL: "INS011",
  AMZN: "INS012",
  VOO: "INS013",
  NVDA: "INS014",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function PortfolioCard() {
  const portfolio = mockPortfolio
  const isPositive = portfolio.dayChangePercent >= 0

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-card pb-6">
        <CardTitle className="text-lg font-semibold">Customer Portfolio</CardTitle>
        <CardDescription className="text-muted-foreground">
          {portfolio.customerName} · {portfolio.customerId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex min-h-[88px] flex-col justify-between rounded-lg border border-border/80 bg-muted/40 p-4 transition-colors hover:bg-muted/60">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Value
            </span>
            <div>
              <p className="text-lg font-semibold tabular-nums tracking-tight">
                {formatCurrency(portfolio.totalValue)}
              </p>
              <p
                className={`mt-0.5 text-xs font-medium tabular-nums ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatPercent(portfolio.dayChangePercent)} today
              </p>
            </div>
          </div>
          <div className="flex min-h-[88px] flex-col justify-between rounded-lg border border-border/80 bg-muted/40 p-4 transition-colors hover:bg-muted/60">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Invested
            </span>
            <p className="text-lg font-semibold tabular-nums tracking-tight">
              {formatCurrency(portfolio.investedValue)}
            </p>
          </div>
          <div className="flex min-h-[88px] flex-col justify-between rounded-lg border border-border/80 bg-muted/40 p-4 transition-colors hover:bg-muted/60">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cash Balance
            </span>
            <p className="text-lg font-semibold tabular-nums tracking-tight">
              {formatCurrency(portfolio.cashBalance)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Holdings</h3>
          <div className="rounded-lg border border-border/80 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableHead className="h-11 bg-muted/50 font-medium text-muted-foreground">
                    Symbol
                  </TableHead>
                  <TableHead className="h-11 bg-muted/50 font-medium text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="h-11 bg-muted/50 text-right font-medium text-muted-foreground">
                    Qty
                  </TableHead>
                  <TableHead className="h-11 bg-muted/50 text-right font-medium text-muted-foreground">
                    Value
                  </TableHead>
                  <TableHead className="h-11 bg-muted/50 text-right font-medium text-muted-foreground">
                    Change
                  </TableHead>
                  <TableHead className="h-11 bg-muted/50 text-center font-medium text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.holdings.map((holding) => (
                  <TableRow key={holding.symbol} className="border-border/80">
                    <TableCell className="py-3 font-medium">{holding.symbol}</TableCell>
                    <TableCell className="py-3 text-muted-foreground">{holding.name}</TableCell>
                    <TableCell className="py-3 text-right tabular-nums">{holding.quantity}</TableCell>
                    <TableCell className="py-3 text-right tabular-nums">
                      {formatCurrency(holding.value)}
                    </TableCell>
                    <TableCell
                      className={`py-3 text-right font-medium tabular-nums ${
                        holding.changePercent >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(holding.changePercent)}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {SYMBOL_TO_INSTRUMENT_ID[holding.symbol] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => {
                            window.location.href = `/oms/order/${SYMBOL_TO_INSTRUMENT_ID[holding.symbol]}`
                          }}
                        >
                          Trade
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-muted-foreground border-t border-border/80 pt-4 text-xs">
          Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
