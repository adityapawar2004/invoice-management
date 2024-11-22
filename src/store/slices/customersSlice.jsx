import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCustomer: (state, action) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(cust => cust.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(cust => cust.id !== action.payload);
    },
    updateCustomerPurchaseAmount: (state, action) => {
      const { customerId, amount } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.totalPurchaseAmount = amount;
      }
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { 
  setCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer,
  updateCustomerPurchaseAmount,
  setLoading,
  setError 
} = customersSlice.actions;

export default customersSlice.reducer; 