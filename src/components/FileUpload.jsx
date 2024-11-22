import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { processFileWithGemini } from '../services/geminiService';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, addData } from '../redux/tableSlice';

function FileUpload() {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.table.isLoading);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    try {
      if (acceptedFiles.length === 0) {
        throw new Error('No file selected');
      }

      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 10MB');
      }

      dispatch(setLoading(true));
      
      try {
        let result;
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
          const csvData = await convertExcelToCSV(file);
          result = await processFileWithGemini(new Blob([csvData], { type: 'text/csv' }));
        } else {
          result = await processFileWithGemini(file);
        }

        const parsedData = parseGeminiResponse(result, file.name);
        dispatch(addData(parsedData));
      } catch (error) {
        if (error.message.includes('No data found in the image or PDF')) {
          throw new Error('No data found in the file. Please ensure the file contains valid invoice information and try again.');
        }
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const convertExcelToCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvData = XLSX.utils.sheet_to_csv(firstSheet);
          resolve(csvData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #cccccc',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: isLoading ? 'default' : 'pointer',
        '&:hover': {
          borderColor: isLoading ? '#cccccc' : 'primary.main',
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        minHeight: '180px'
      }}
    >
      <input {...getInputProps()} disabled={isLoading} />
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,justifyContent:'center' }}>
          <CircularProgress />
          <Typography>Uploading file...</Typography>
        </Box>
      ) : (
        <>
          <UploadFileIcon 
            sx={{ 
              fontSize: 40,
              color: 'grey',
              mb: 0.5
            }} 
          />
          <Typography variant="h6" color="grey">
            {isDragActive
              ? "Drop the file here..."
              : "Drag 'n' drop a file here"
            }
          </Typography>
          <Typography 
            variant="body1" 
            color="textSecondary"
          >
            or click to select
          </Typography>
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ mt: 1 }}
          >
            Supported formats: PDF, JPG, JPEG, PNG, XLSX, XLS, CSV
          </Typography>
        </>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.message}<Typography>No data Found in the file.</Typography>
        </Alert>
      )}
    </Box>
  );
}

function parseGeminiResponse(response, fileName) {
  try {
    const jsonString = response.replace(/```json\n|\n```/g, '').trim();
    let parsedData = JSON.parse(jsonString);

    // Check if the response contains empty arrays
    if (parsedData.invoices.length === 0 && 
        parsedData.products.length === 0 && 
        parsedData.customers.length === 0) {
      throw new Error('No data could be extracted from the file. Please check if the file contains valid invoice data.');
    }

    return {
      customers: parsedData.customers.map(customer => ({
        id: `customer-${Date.now()}-${Math.random()}`,
        fileName: fileName,
        customerName: customer.customerName || customer['Customer Name'] || '',
        phoneNumber: customer.phoneNumber || customer['Phone Number'] || '',
        totalPurchaseAmount: customer.totalPurchaseAmount || customer['Total Purchase Amount'] || 0
      })),
      
      invoices: parsedData.invoices.map(invoice => ({
        id: `invoice-${Date.now()}-${Math.random()}`,
        fileName: fileName,
        serialNumber: invoice.serialNumber || invoice['Serial Number'] || '',
        customerName: invoice.customerName || invoice['Customer Name'] || '',
        productName: invoice.productName || invoice['Product Name'] || '',
        quantity: invoice.quantity || invoice.Quantity || 0,
        tax: invoice.tax || invoice.Tax || 0,
        totalAmount: invoice.totalAmount || invoice['Total Amount'] || 0,
        date: invoice.date || invoice.Date || '',
        discount: invoice.discount || invoice.Discount || 0
      })),
      
      products: parsedData.products.map(product => ({
        id: `product-${Date.now()}-${Math.random()}`,
        fileName: fileName,
        name: product.name || product.Name || '',
        quantity: product.quantity || product.Quantity || 0,
        unitPrice: product.unitPrice || product['Unit Price'] || 0,
        tax: product.tax || product.Tax || 0,
        priceWithTax: product.priceWithTax || product['Price with Tax'] || 0,
        discount: product.discount || product.Discount || 0
      }))
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      customers: [],
      products: [],
      invoices: []
    };
  }
}

export default FileUpload; 