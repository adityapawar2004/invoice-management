import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch } from 'react-redux';
import { updateTableData } from '../redux/tableSlice';

function CustomTable({ columns, data, tableKey }) {
  const dispatch = useDispatch();
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleEditClick = (row) => {
    setEditingRow(row.id);
    setEditedData({ ...row });
  };

  const handleSaveClick = () => {
    if (!tableKey) {
      console.error('tableKey is required for updating data');
      return;
    }
    
    dispatch(updateTableData({ 
      tableKey, 
      editedRow: { ...editedData }
    }));
    
    setEditingRow(null);
    setEditedData({});
  };

  const handleInputChange = (key, value) => {
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.key === 'actions' ? (
                    editingRow === row.id ? (
                      <IconButton 
                        color="primary"
                        onClick={handleSaveClick}
                        size="small"
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditClick(row)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    )
                  ) : editingRow === row.id && column.key !== 'fileName' ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedData[column.key] || ''}
                      onChange={(e) => handleInputChange(column.key, e.target.value)}
                      variant="outlined"
                      type={
                        column.key.includes('date') ? 'date' :
                        (column.key.includes('quantity') || 
                         column.key.includes('price') || 
                         column.key.includes('amount') || 
                         column.key.includes('tax')) ? 'number' : 'text'
                      }
                      InputProps={{
                        style: { fontSize: '0.875rem' }
                      }}
                    />
                  ) : (
                    formatValue(row[column.key], column.key)
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Helper function to format values
const formatValue = (value, key) => {
  if (key === 'fileName') {
    return value.split('.').slice(0, -1).join('.').split('/').pop();
  }
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('price') || 
        key.toLowerCase().includes('amount') || 
        key.toLowerCase().includes('tax')) {
      return `₹${value.toFixed(2)}`;
    }
    return value.toString();
  }
  return value || '-';
};

export default CustomTable; 