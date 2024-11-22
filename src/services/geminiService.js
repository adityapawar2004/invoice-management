import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';

export const processFileWithGemini = async (file) => {
  try {
    if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
      return await processSpreadsheetFile(file);
    } else {
      return await processImageOrPDF(file);
    }
  } catch (error) {
    throw new Error(error.message || "No data could be extracted from this file");
  }
};

const processSpreadsheetFile = async (file) => {
  try {
    const data = await readSpreadsheetData(file);
    // Add fileName to the formatted data
    const formattedData = {
      invoices: extractInvoices(data, file.name),
      products: extractProducts(data, file.name),
      customers: extractCustomers(data, file.name)
    };
    return JSON.stringify(formattedData);
  } catch (error) {
    console.error("Error processing spreadsheet:", error);
    throw error;
  }
};

const readSpreadsheetData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const extractInvoices = (data, fileName) => {
  return data.map((row, index) => ({
    id: `invoice-${Date.now()}-${index}`,
    fileName: fileName,
    serialNumber: row['Serial Number'] || row['Invoice Number'] || row['serialNumber'] || '',
    customerName: row['Customer Name'] || row['customerName'] || '',
    productName: row['Product Name'] || row['productName'] || '',
    quantity: Number(row['Quantity'] || row['quantity'] || 0),
    tax: Number(row['Tax'] || row['tax'] || 0),
    totalAmount: Number(row['Total Amount'] || row['totalAmount'] || 0),
    date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0]
  }));
};

const extractProducts = (data, fileName) => {
  return data.map((row, index) => ({
    id: `product-${Date.now()}-${index}`,
    fileName: fileName,
    name: row['Product Name'] || row['productName'] || '',
    quantity: Number(row['Quantity'] || row['quantity'] || 0),
    unitPrice: Number(row['Unit Price'] || row['unitPrice'] || 0),
    tax: Number(row['Tax'] || row['tax'] || 0),
    priceWithTax: Number(row['Price with Tax'] || row['priceWithTax'] || 0),
    discount: Number(row['Discount'] || row['discount'] || 0)
  }));
};

const extractCustomers = (data, fileName) => {
  const customerMap = new Map();

  data.forEach(row => {
    const customerName = row['Customer Name'] || row['customerName'] || '';
    const phoneNumber = row['Phone Number'] || row['phoneNumber'] || '';
    const invoiceAmount = Number(row['Total Amount'] || row['totalAmount'] || 0);

    // Create a single entry for the Excel file
    const key = fileName; // Use fileName as the key
    
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: `customer-${Date.now()}-${fileName}`,
        customerName: customerName || '-', // Default name if not found
        phoneNumber: phoneNumber || '-',
        totalPurchaseAmount: invoiceAmount,
        fileName: fileName // Add fileName to track the source
      });
    } else {
      const customer = customerMap.get(key);
      customer.totalPurchaseAmount += invoiceAmount;
      // Update customer name and phone if available
      if (customerName && !customer.customerName.includes(customerName)) {
        customer.customerName = customer.customerName === 'Excel Data' ? 
          customerName : `${customer.customerName}, ${customerName}`;
      }
      if (phoneNumber && customer.phoneNumber === '-') {
        customer.phoneNumber = phoneNumber;
      }
    }
  });

  return Array.from(customerMap.values());
};

const processImageOrPDF = async (file) => {
  try {
    const base64Data = await fileToBase64(file);
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this ${file.type.includes('pdf') ? 'PDF document' : 'image'} and extract the following information into three distinct sections:

1. Invoices section: Create a separate invoice entry for EACH product found in the image, with exactly these fields:
   - Serial Number (use the same invoice number for all products from the same invoice)
   - Customer Name
   - Product Name
   - Quantity
   - Tax
   - Total Amount (individual product total)
   - Date

2. Products section: Create a separate entry for EACH unique product found, with exactly these fields:
   - Name
   - Quantity
   - Unit Price
   - Tax
   - Price with Tax
   - Discount (optional)

3. Customers section with exactly these fields:
   - Customer Name
   - Phone Number
   - Total Purchase Amount (sum of all products)

Return ONLY a JSON object with these three sections: "invoices", "products", and "customers".
Format numbers as plain numbers without currency symbols.
Do not include any explanatory text or markdown formatting.
If multiple products are found in a single invoice, create separate entries for each product while maintaining the same invoice number.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Check for empty response
    if (text.includes('"invoices": []') && 
        text.includes('"products": []') && 
        text.includes('"customers": []')) {
      throw new Error('No data found in the image or PDF. Please ensure the file contains valid invoice information.');
    }

    return text;
  } catch (error) {
    throw new Error('No data could be extracted from this file');
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}; 