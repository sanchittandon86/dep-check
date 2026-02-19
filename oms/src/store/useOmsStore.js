import { create } from 'zustand';
import instrumentsData from '../data/instruments';
import bankAccountsData from '../data/bankAccounts';
import { getRate } from '../data/fxRates';
import { dispatchNotification } from '../utils/eventDispatcher';

const INITIAL_ORDER_FORM = {
  bankAccountId: '',
  transactionType: 'buy',
  orderType: 'MKT',
  orderBy: 'quantity',
  quantity: '',
  amount: '',
  limitPrice: '',
  feeExceptionApplicable: false,
  exceptionFeePercent: '',
  // SIP/SWP fields
  placeFirstOrderToday: false,
  startDate: '',
  frequency: '',
  tenure: '',
  numberOfUnits: '',
  installmentAmount: '',
};

const useOmsStore = create((set, get) => ({
  instruments: instrumentsData,
  bankAccounts: bankAccountsData,

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  filteredInstruments: () => {
    const { instruments, searchQuery } = get();
    if (!searchQuery.trim()) return instruments;
    const q = searchQuery.toLowerCase();
    return instruments.filter(
      (ins) =>
        ins.name.toLowerCase().includes(q) ||
        ins.ticker.toLowerCase().includes(q) ||
        ins.assetType.toLowerCase().includes(q) ||
        ins.subAssetType.toLowerCase().includes(q)
    );
  },

  selectedInstrument: null,
  selectInstrument: (instrument) => set({ selectedInstrument: instrument }),
  clearSelectedInstrument: () => set({ selectedInstrument: null }),

  orderForm: { ...INITIAL_ORDER_FORM },

  setOrderField: (field, value) =>
    set((state) => ({
      orderForm: { ...state.orderForm, [field]: value },
    })),

  setTransactionType: (type) =>
    set((state) => {
      const isSipSwp = type === 'sip' || type === 'swp';
      return {
        orderForm: {
          ...state.orderForm,
          transactionType: type,
          orderType: isSipSwp ? 'MKT' : state.orderForm.orderType,
          ...(isSipSwp
            ? {}
            : {
                placeFirstOrderToday: false,
                startDate: '',
                frequency: '',
                tenure: '',
                numberOfUnits: '',
                installmentAmount: '',
              }),
        },
      };
    }),

  resetOrderForm: () =>
    set({ orderForm: { ...INITIAL_ORDER_FORM } }),

  getSelectedBankAccount: () => {
    const { bankAccounts, orderForm } = get();
    return bankAccounts.find((ba) => ba.id === orderForm.bankAccountId) || null;
  },

  getFxRate: () => {
    const { selectedInstrument } = get();
    const bankAccount = get().getSelectedBankAccount();
    if (!selectedInstrument || !bankAccount) return null;
    return getRate(bankAccount.currency, selectedInstrument.currency);
  },

  getEffectivePrice: () => {
    const { selectedInstrument, orderForm } = get();
    if (!selectedInstrument) return 0;
    if (orderForm.orderType === 'LMT' && parseFloat(orderForm.limitPrice) > 0) {
      return parseFloat(orderForm.limitPrice);
    }
    return selectedInstrument.price;
  },

  getTotalAmount: () => {
    const { orderForm } = get();
    const price = get().getEffectivePrice();

    if (orderForm.orderBy === 'amount') {
      const amt = parseFloat(orderForm.amount);
      return !isNaN(amt) && amt > 0 ? Math.round(amt * 100) / 100 : 0;
    }

    const qty = parseFloat(orderForm.quantity);
    if (isNaN(qty) || qty <= 0 || price <= 0) return 0;
    return Math.round(price * qty * 100) / 100;
  },

  getDerivedQuantity: () => {
    const { orderForm } = get();
    if (orderForm.orderBy !== 'amount') return null;
    const amt = parseFloat(orderForm.amount);
    const price = get().getEffectivePrice();
    if (isNaN(amt) || amt <= 0 || price <= 0) return null;
    return Math.round((amt / price) * 10000) / 10000;
  },

  getTotalInAccountCurrency: () => {
    const total = get().getTotalAmount();
    const fxRate = get().getFxRate();
    if (!fxRate || total === 0) return null;
    return Math.round((total / fxRate) * 100) / 100;
  },

  isSubmitting: false,

  submitOrder: async () => {
    const { selectedInstrument, orderForm } = get();
    const bankAccount = get().getSelectedBankAccount();
    const total = get().getTotalAmount();

    const hasQuantityOrAmount =
      orderForm.orderBy === 'quantity'
        ? parseFloat(orderForm.quantity) > 0
        : parseFloat(orderForm.amount) > 0;

    if (!selectedInstrument || !bankAccount || !hasQuantityOrAmount || total <= 0) {
      dispatchNotification({
        type: 'error',
        title: 'Order Validation Failed',
        message: 'Please fill in all required fields.',
      });
      return false;
    }

    set({ isSubmitting: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const success = Math.random() > 0.15;
      const txLabel = orderForm.transactionType.toUpperCase();

      if (success) {
        dispatchNotification({
          type: 'success',
          title: 'Order Placed Successfully',
          message: `${txLabel} ${orderForm.orderType} order for ${selectedInstrument.ticker} placed at ${selectedInstrument.currency} ${total.toLocaleString()}.`,
        });
        get().resetOrderForm();
        set({ isSubmitting: false });
        return true;
      } else {
        dispatchNotification({
          type: 'error',
          title: 'Order Failed',
          message: `Failed to place ${txLabel} order for ${selectedInstrument.ticker}. Please try again.`,
        });
        set({ isSubmitting: false });
        return false;
      }
    } catch {
      dispatchNotification({
        type: 'error',
        title: 'Order Error',
        message: 'An unexpected error occurred while placing the order.',
      });
      set({ isSubmitting: false });
      return false;
    }
  },
}));

export default useOmsStore;
