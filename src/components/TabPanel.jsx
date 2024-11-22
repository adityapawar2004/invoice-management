import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import CustomTable from './CustomTable';
import { useSelector } from 'react-redux';

function TabPanel() {
  const [value, setValue] = useState(0);
  const { customers, products, invoices } = useSelector(state => state.table);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    {
      key: 'invoices',
      label: 'Invoices',
      columns: [
        { key: 'actions', label: 'Actions' },
        { key: 'fileName', label: 'File Name' },
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'productName', label: 'Product Name' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'tax', label: 'Tax' },
        { key: 'totalAmount', label: 'Total Amount' },
        { key: 'date', label: 'Date' }
      ],
      data: invoices
    },
    {
      key: 'products',
      label: 'Products',
      columns: [
        { key: 'actions', label: 'Actions' },
        { key: 'fileName', label: 'File Name' },
        { key: 'name', label: 'Name' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unitPrice', label: 'Unit Price' },
        { key: 'tax', label: 'Tax' },
        { key: 'priceWithTax', label: 'Price with Tax' },
        { key: 'discount', label: 'Discount' }
      ],
      data: products
    },
    {
      key: 'customers',
      label: 'Customers',
      columns: [
        { key: 'actions', label: 'Actions' },
        { key: 'fileName', label: 'File Name' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'phoneNumber', label: 'Phone Number' },
        { key: 'totalPurchaseAmount', label: 'Total Purchase Amount' }
      ],
      data: customers
    }
  ];

  return (
    <Box>
      <Tabs value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          hidden={value !== index}
          style={{ padding: '20px' }}
        >
          {value === index && (
            <CustomTable 
              columns={tab.columns} 
              data={tab.key === 'invoices' ? invoices : 
                    tab.key === 'products' ? products : 
                    customers} 
              tableKey={tab.key}
            />
          )}
        </div>
      ))}
    </Box>
  );
}

export default TabPanel; 