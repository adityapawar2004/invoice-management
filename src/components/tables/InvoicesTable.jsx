import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography 
} from '@mui/material';

const InvoicesTable = () => {
  const invoices = useSelector(state => state.invoices.invoices);

  if (invoices.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ p: 3 }}>
        No invoice data available. Please upload a file.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tax</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow 
              key={invoice.id}
              sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
            >
              <TableCell>{invoice.serialNumber}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>{invoice.productName}</TableCell>
              <TableCell>{invoice.quantity}</TableCell>
              <TableCell>{invoice.tax}%</TableCell>
              <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoicesTable; 