import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  products: [],
  invoices: [],
  isLoading: false
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addData: (state, action) => {
      const { customers = [], products = [], invoices = [] } = action.payload;
      state.customers = [...state.customers, ...customers];
      state.products = [...state.products, ...products];
      state.invoices = [...state.invoices, ...invoices];
    },
    updateTableData: (state, action) => {
      const { tableKey, editedRow } = action.payload;

      // Handle updates from Invoices tab
      if (tableKey === 'invoices') {
        const oldInvoice = state.invoices.find(inv => inv.id === editedRow.id);

        // Update the invoice itself
        state.invoices = state.invoices.map(invoice =>
          invoice.id === editedRow.id ? editedRow : invoice
        );

        if (oldInvoice) {
          // If product name changed, update all related records
          if (oldInvoice.productName !== editedRow.productName) {
            // Update all invoices with the same old product name from same file
            state.invoices = state.invoices.map(invoice => {
              if (invoice.productName === oldInvoice.productName && 
                  invoice.fileName === oldInvoice.fileName) {
                return {
                  ...invoice,
                  productName: editedRow.productName
                };
              }
              return invoice;
            });

            // Update product records from same file
            state.products = state.products.map(product => {
              if (product.name === oldInvoice.productName && 
                  product.fileName === oldInvoice.fileName) {
                return {
                  ...product,
                  name: editedRow.productName,
                  quantity: state.invoices
                    .filter(inv => 
                      inv.productName === editedRow.productName && 
                      inv.fileName === oldInvoice.fileName
                    )
                    .reduce((sum, inv) => sum + Number(inv.quantity || 0), 0)
                };
              }
              return product;
            });
          }

          // If customer name changed, update all related records
          if (oldInvoice.customerName !== editedRow.customerName) {
            // Update all invoices with the same old customer name
            state.invoices = state.invoices.map(invoice => {
              if (invoice.customerName === oldInvoice.customerName) {
                return {
                  ...invoice,
                  customerName: editedRow.customerName
                };
              }
              return invoice;
            });

            // Update customer records
            state.customers = state.customers.map(customer => {
              if (customer.customerName === oldInvoice.customerName) {
                return {
                  ...customer,
                  customerName: editedRow.customerName,
                  totalPurchaseAmount: state.invoices
                    .filter(inv => inv.customerName === editedRow.customerName)
                    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
                };
              }
              return customer;
            });
          }

          // Update totals
          const updatedCustomerName = editedRow.customerName;
          if (updatedCustomerName) {
            state.customers = state.customers.map(customer => {
              if (customer.customerName === updatedCustomerName) {
                return {
                  ...customer,
                  totalPurchaseAmount: state.invoices
                    .filter(inv => inv.customerName === updatedCustomerName)
                    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
                };
              }
              return customer;
            });
          }
        }
      }

      // Handle updates from Products tab
      if (tableKey === 'products') {
        const oldProduct = state.products.find(prod => prod.id === editedRow.id);

        // Update the product itself
        state.products = state.products.map(product =>
          product.id === editedRow.id ? editedRow : product
        );

        if (oldProduct && oldProduct.name !== editedRow.name) {
          // Update all products with the same name from same file
          state.products = state.products.map(product => {
            if (product.name === oldProduct.name && 
                product.fileName === oldProduct.fileName) {
              return {
                ...product,
                name: editedRow.name
              };
            }
            return product;
          });

          // Update all related invoices from same file
          state.invoices = state.invoices.map(invoice => {
            if (invoice.productName === oldProduct.name && 
                invoice.fileName === oldProduct.fileName) {
              return {
                ...invoice,
                productName: editedRow.name
              };
            }
            return invoice;
          });

          // Recalculate quantities for the updated product
          const updatedProduct = state.products.find(p => p.id === editedRow.id);
          if (updatedProduct) {
            state.products = state.products.map(product => {
              if (product.name === editedRow.name && 
                  product.fileName === oldProduct.fileName) {
                return {
                  ...product,
                  quantity: state.invoices
                    .filter(inv => 
                      inv.productName === editedRow.name && 
                      inv.fileName === oldProduct.fileName
                    )
                    .reduce((sum, inv) => sum + Number(inv.quantity || 0), 0)
                };
              }
              return product;
            });
          }
        }
      }
    },
    clearAllData: (state) => {
      state.customers = [];
      state.products = [];
      state.invoices = [];
      state.isLoading = false;
    }
  }
});

export const { setLoading, addData, updateTableData, clearAllData } = tableSlice.actions;
export default tableSlice.reducer; 