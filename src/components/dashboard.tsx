
"use client";

import { useMemo } from 'react';
import { DollarSign, ShoppingCart, Percent, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { type Transaction } from '@/lib/data';
import { Dictionary } from '@/dictionaries';
import { useAuth } from '@/context/auth-context';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CustomTooltip({ active, payload, label, currency, dictionary }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">{`${dictionary.dashboard.totalRevenue}: ${formatCurrency(payload[0].value, currency)}`}</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard({
  transactions,
  dictionary,
  timeframe = 'all-time',
}: {
  transactions: Transaction[];
  dictionary: Dictionary;
  timeframe?: '1hour' | 'all-time';
}) {
  const { userData } = useAuth();
  const currency = userData?.currency || 'USD';
  const d = dictionary.dashboard;

  const filteredTransactions = useMemo(() => {
    if (timeframe === '1hour') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return transactions.filter(
        (tx) => new Date(tx.date) > oneHourAgo
      );
    }
    return transactions;
  }, [transactions, timeframe]);

  const stats = useMemo(() => {
    const completedTx = filteredTransactions.filter(
      (tx) => tx.type === 'receipt' && tx.status === dictionary.status.Completed
    );
    const failedTx = filteredTransactions.filter(
      (tx) => tx.type === 'receipt' && tx.status === dictionary.status.Failed
    );

    const totalRevenue = completedTx.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSales = completedTx.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalRequests = completedTx.length + failedTx.length;
    const cancellationRate = totalRequests > 0 ? (failedTx.length / totalRequests) * 100 : 0;

    return { totalRevenue, totalSales, avgOrderValue, cancellationRate };
  }, [filteredTransactions, dictionary.status]);

  const chartData = useMemo(() => {
    const revenueByDate: { [key: string]: number } = {};
    const completedTx = filteredTransactions.filter(
        (tx) => tx.type === 'receipt' && tx.status === dictionary.status.Completed
      );

    completedTx.forEach((tx) => {
      const date = new Date(tx.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += tx.amount;
    });

    return Object.entries(revenueByDate)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredTransactions, dictionary.status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{d.title}</h1>
        <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-md">
          {timeframe === '1hour' ? d.lastHour : d.allTime}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{d.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue, currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{d.totalSales}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{d.avgOrderValue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgOrderValue, currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{d.cancellationRate}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cancellationRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>{d.revenueChartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => formatCurrency(value as number, currency)}
                        />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          content={<CustomTooltip currency={currency} dictionary={dictionary} />}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
