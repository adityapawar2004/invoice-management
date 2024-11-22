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

const ProductsTable = () => {
  const products = useSelector(state => state.products.products);

  if (products.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ p: 3 }}>
        No product data available. Please upload a file.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tax</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Price with Tax</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
            >
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
              <TableCell>{product.tax}%</TableCell>
              <TableCell>
                ${(product.unitPrice * (1 + product.tax / 100)).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable; 