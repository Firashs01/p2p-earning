import { getDashboardData, addTrade, deleteTrade } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Prepare chart data (oldest to newest for visual timeline)
  const chartData = [...data.archive].reverse()
  const maxRevenue = chartData.length > 0 
    ? Math.max(...chartData.map(item => Math.max(parseFloat(item.revenue.replace(/,/g, '')), 1)))
    : 1

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl px-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            P2P Trading Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Active Period: <span className="font-semibold text-foreground">{data.currentMonth} {data.currentYear}</span> • Values in TND
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 max-w-md shadow-sm">
          <div className="text-sm font-semibold text-indigo-900">Equations & Calculations:</div>
          <div className="text-xs text-indigo-700 mt-1 font-mono leading-relaxed space-y-1">
            <div>• Profit = USDT Sold × (Avg Sell Rate - Avg Buy Rate)</div>
            <div>• Daily Earnings = (USDT Bought Today × Latest Sell Rate) - Buy Cost</div>
          </div>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* Today's Earnings */}
        <Card className="border-l-4 border-l-purple-600 bg-gradient-to-br from-purple-50/40 to-white shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {data.dailyEarnings} <span className="text-xs font-medium text-muted-foreground">TND</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{data.todayDate}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Q: {data.totalUsdtPurchasedToday} • Sell: {data.latestSellRate}
            </p>
          </CardContent>
        </Card>

        {/* Avg Buy Price */}
        <Card className="border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Buy Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.avgBuyPrice} <span className="text-xs font-medium text-muted-foreground">TND</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bought: {data.totalUsdtBought} USDT</p>
          </CardContent>
        </Card>
        
        {/* Avg Sell Price */}
        <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Sell Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.avgSellPrice} <span className="text-xs font-medium text-muted-foreground">TND</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sold: {data.totalUsdtSold} USDT</p>
          </CardContent>
        </Card>
        
        {/* USDT Sold */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">USDT Sold (Q)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalUsdtSold} <span className="text-xs font-medium text-muted-foreground">USDT</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">From {data.totalTrades} active trades</p>
          </CardContent>
        </Card>
        
        {/* Active Month Profit */}
        <Card className="border-l-4 border-l-indigo-600 bg-gradient-to-br from-indigo-50/30 to-white shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Month Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {data.netProfit} <span className="text-xs font-medium text-muted-foreground">TND</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">For {data.currentMonth} {data.currentYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* History and Chart Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Historical Monthly Revenue</CardTitle>
            <CardDescription>Visual timeline of archived profits (TND).</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-end pt-4">
            {chartData.length > 0 ? (
              <div className="h-44 flex items-end gap-3 border-b border-l pb-2 pl-2 relative">
                {chartData.map((item) => {
                  const revVal = parseFloat(item.revenue.replace(/,/g, ''))
                  const heightPercent = maxRevenue > 0 ? (revVal / maxRevenue) * 100 : 0
                  return (
                    <div key={`${item.month}-${item.year}`} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      {/* Tooltip on Hover */}
                      <div className="absolute z-10 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded py-1 px-2 pointer-events-none whitespace-nowrap shadow-md">
                        {item.revenue} TND
                      </div>
                      
                      {/* Bar */}
                      <div 
                        style={{ height: `${Math.max(heightPercent, 6)}%` }} 
                        className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t hover:from-indigo-500 hover:to-blue-400 transition-all duration-300 shadow-sm"
                      />
                      
                      {/* X-axis Label */}
                      <span className="text-[10px] font-medium text-muted-foreground mt-1 select-none">
                        {item.month.slice(0, 3)} '{item.year.toString().slice(-2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center border border-dashed rounded-lg bg-slate-50 text-sm text-muted-foreground">
                No monthly history archived yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue History Ledger */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue History Archive</CardTitle>
            <CardDescription>Permanently archived monthly records.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Archived Revenue (TND)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.archive.map((entry, index) => (
                  <TableRow key={`${entry.month}-${entry.year}-${index}`}>
                    <TableCell className="font-medium">
                      {entry.month} {entry.year}
                    </TableCell>
                    <TableCell className="text-right text-indigo-600 font-bold">
                      {entry.revenue} TND
                    </TableCell>
                  </TableRow>
                ))}
                {data.archive.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      No archived months. Completed months are archived automatically.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add New Trade Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Add New Trade ({data.currentMonth})</CardTitle>
          <CardDescription>Record a BUY or SELL transaction for the current active period.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addTrade} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select name="type" defaultValue="BUY">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity (USDT)</label>
              <Input name="quantity" type="number" step="any" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate (TND/USDT)</label>
              <Input name="rate" type="number" step="any" placeholder="0.000" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee (TND)</label>
              <Input name="fee" type="number" step="any" placeholder="0.000" defaultValue="0" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Add Trade</Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Trades Ledger */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active Month Trades Ledger ({data.currentMonth})</CardTitle>
          <CardDescription>A list of transactions completed during the active month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Quantity (USDT)</TableHead>
                <TableHead>Rate (TND/USDT)</TableHead>
                <TableHead>Fee (TND)</TableHead>
                <TableHead>Total (TND)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className={trade.type === 'BUY' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{trade.type}</TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>{trade.rate}</TableCell>
                  <TableCell>{trade.fee}</TableCell>
                  <TableCell>{trade.total}</TableCell>
                  <TableCell>{trade.createdAt ? new Date(trade.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteTrade.bind(null, trade.id)}>
                      <Button variant="destructive" size="sm" type="submit">Delete</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {data.trades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No active trades recorded this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
