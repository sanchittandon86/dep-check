import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useOmsStore from '@/store/useOmsStore';

const TRANSACTION_TYPES = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
  { value: 'sip', label: 'SIP' },
  { value: 'swp', label: 'SWP' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annually', label: 'Semi Annually' },
  { value: 'annually', label: 'Annually' },
];

export default function CreateOrder() {
  const { instrumentId } = useParams();
  const navigate = useNavigate();

  const instruments = useOmsStore((s) => s.instruments);
  const selectedInstrument = useOmsStore((s) => s.selectedInstrument);
  const selectInstrument = useOmsStore((s) => s.selectInstrument);
  const bankAccounts = useOmsStore((s) => s.bankAccounts);
  const orderForm = useOmsStore((s) => s.orderForm);
  const setOrderField = useOmsStore((s) => s.setOrderField);
  const setTransactionType = useOmsStore((s) => s.setTransactionType);
  const resetOrderForm = useOmsStore((s) => s.resetOrderForm);
  const getFxRate = useOmsStore((s) => s.getFxRate);
  const getEffectivePrice = useOmsStore((s) => s.getEffectivePrice);
  const getTotalAmount = useOmsStore((s) => s.getTotalAmount);
  const getDerivedQuantity = useOmsStore((s) => s.getDerivedQuantity);
  const getTotalInAccountCurrency = useOmsStore((s) => s.getTotalInAccountCurrency);
  const getSelectedBankAccount = useOmsStore((s) => s.getSelectedBankAccount);
  const submitOrder = useOmsStore((s) => s.submitOrder);
  const isSubmitting = useOmsStore((s) => s.isSubmitting);

  useEffect(() => {
    if (!selectedInstrument) {
      const found = instruments.find((i) => i.id === instrumentId);
      if (found) selectInstrument(found);
      else navigate('..');
    }
  }, [instrumentId, selectedInstrument, instruments, selectInstrument, navigate]);

  if (!selectedInstrument) return null;

  const fxRate = getFxRate();
  const effectivePrice = getEffectivePrice();
  const totalAmount = getTotalAmount();
  const derivedQty = getDerivedQuantity();
  const totalInAccountCurrency = getTotalInAccountCurrency();
  const selectedBank = getSelectedBankAccount();
  const needsFx = selectedBank && selectedBank.currency !== selectedInstrument.currency;

  const isSipSwp = orderForm.transactionType === 'sip' || orderForm.transactionType === 'swp';
  const isLimitOrder = orderForm.orderType === 'LMT';
  const isOrderByAmount = orderForm.orderBy === 'amount';
  const isOrderByQuantity = orderForm.orderBy === 'quantity';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitOrder();
    if (success) navigate('..');
  };

  const handleBack = () => {
    resetOrderForm();
    navigate('..');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Instruments
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review instrument details and place your order
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        {/* ───── Instrument Details ───── */}
        <Card>
          <CardHeader>
            <CardTitle>Instrument Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Name" value={selectedInstrument.name} />
              <DetailField label="Ticker" value={selectedInstrument.ticker} className="font-bold text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset Type</p>
                <Badge variant="secondary" className="mt-1">{selectedInstrument.assetType}</Badge>
              </div>
              <DetailField label="Sub Asset Type" value={selectedInstrument.subAssetType} />
              <DetailField
                label="Price"
                value={`${selectedInstrument.currency} ${selectedInstrument.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                className="font-bold text-emerald-600"
              />
              <DetailField label="Exchange" value={selectedInstrument.exchange} />
            </div>

            <Separator />

            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <a href={selectedInstrument.factsheetUrl} target="_blank" rel="noopener noreferrer">
                View Factsheet <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* ───── Order Form ───── */}
        <Card>
          <CardHeader>
            <CardTitle>Order Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bank Account */}
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Select
                  value={orderForm.bankAccountId}
                  onValueChange={(val) => setOrderField('bankAccountId', val)}
                >
                  <SelectTrigger id="bankAccount" className="w-full">
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((ba) => (
                      <SelectItem key={ba.id} value={ba.id}>
                        {ba.label} ({ba.currency} {ba.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buy / Sell */}
              <div className="space-y-2">
                <Label>Buy / Sell</Label>
                <Select
                  value={orderForm.transactionType}
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Type — hidden for SIP/SWP */}
              {!isSipSwp && (
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <div className="flex gap-2">
                    {['MKT', 'LMT'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={orderForm.orderType === type ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setOrderField('orderType', type)}
                      >
                        {type === 'MKT' ? 'Market' : 'Limit'}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Limit Price — only for LMT orders */}
              {isLimitOrder && !isSipSwp && (
                <div className="space-y-2">
                  <Label htmlFor="limitPrice">Limit Price ({selectedInstrument.currency})</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter limit price"
                    value={orderForm.limitPrice}
                    onChange={(e) => setOrderField('limitPrice', e.target.value)}
                  />
                </div>
              )}

              {/* Order By toggle */}
              <div className="space-y-2">
                <Label>Order By</Label>
                <div className="flex gap-2">
                  {['quantity', 'amount'].map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={orderForm.orderBy === mode ? 'default' : 'outline'}
                      className="flex-1 capitalize"
                      onClick={() => setOrderField('orderBy', mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity
                  {isOrderByAmount && derivedQty !== null && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (≈ {derivedQty} units)
                    </span>
                  )}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter quantity"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderField('quantity', e.target.value)}
                  disabled={isOrderByAmount}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({selectedInstrument.currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={orderForm.amount}
                  onChange={(e) => setOrderField('amount', e.target.value)}
                  disabled={isOrderByQuantity}
                />
              </div>

              {/* Fee Exception */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="feeException"
                    checked={orderForm.feeExceptionApplicable}
                    onCheckedChange={(checked) =>
                      setOrderField('feeExceptionApplicable', !!checked)
                    }
                  />
                  <Label htmlFor="feeException" className="cursor-pointer">
                    Fee Exception Applicable
                  </Label>
                </div>
                {orderForm.feeExceptionApplicable && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="exceptionFee">Exception Fee %</Label>
                    <Input
                      id="exceptionFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Ex: 100"
                      value={orderForm.exceptionFeePercent}
                      onChange={(e) => setOrderField('exceptionFeePercent', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* ───── SIP / SWP Fields ───── */}
              {isSipSwp && (
                <>
                  <Separator />
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {orderForm.transactionType === 'sip' ? 'SIP' : 'SWP'} Settings
                  </p>

                  {/* Place first order today */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="placeFirstOrder"
                      checked={orderForm.placeFirstOrderToday}
                      onCheckedChange={(checked) =>
                        setOrderField('placeFirstOrderToday', !!checked)
                      }
                    />
                    <Label htmlFor="placeFirstOrder" className="cursor-pointer">
                      Place first order today
                    </Label>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={orderForm.startDate}
                      onChange={(e) => setOrderField('startDate', e.target.value)}
                    />
                  </div>

                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={orderForm.frequency}
                      onValueChange={(val) => setOrderField('frequency', val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tenure */}
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure</Label>
                    <Input
                      id="tenure"
                      type="text"
                      placeholder="e.g. 12 months"
                      value={orderForm.tenure}
                      onChange={(e) => setOrderField('tenure', e.target.value)}
                    />
                  </div>

                  {/* Number of Units & Installment Amount — mutually exclusive */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfUnits">Number of Units</Label>
                      <Input
                        id="numberOfUnits"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Units"
                        value={orderForm.numberOfUnits}
                        onChange={(e) => setOrderField('numberOfUnits', e.target.value)}
                        disabled={!!orderForm.installmentAmount}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installmentAmount">Installment Amount</Label>
                      <Input
                        id="installmentAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        value={orderForm.installmentAmount}
                        onChange={(e) => setOrderField('installmentAmount', e.target.value)}
                        disabled={!!orderForm.numberOfUnits}
                      />
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* FX Rate */}
              {needsFx && fxRate && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">FX Rate</span>
                  <span className="text-sm font-semibold text-amber-800">
                    1 {selectedBank.currency} = {fxRate} {selectedInstrument.currency}
                  </span>
                </div>
              )}

              {/* Total Amount summary */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                {isLimitOrder && !isSipSwp && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Effective Price</span>
                    <span className="text-xs font-semibold">
                      {selectedInstrument.currency}{' '}
                      {effectivePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-sm font-bold">
                    {selectedInstrument.currency}{' '}
                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {needsFx && totalInAccountCurrency && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Equivalent ({selectedBank.currency})
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {selectedBank.currency}{' '}
                      {totalInAccountCurrency.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailField({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${className}`}>{value}</p>
    </div>
  );
}
