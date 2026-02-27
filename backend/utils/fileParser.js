const XLSX = require('xlsx');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Parse Excel file and extract form fields
 */
async function parseExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const fields = [];
    
    // Assume first row is headers
    if (data.length > 0) {
      const headers = data[0];
      
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header && typeof header === 'string' && header.trim()) {
          // Infer field type from header name
          const fieldType = inferFieldType(header);
          
          fields.push({
            id: `field_${i + 1}`,
            name: header.toLowerCase().replace(/\s+/g, '_'),
            label: header,
            type: fieldType,
            required: false,
          });
        }
      }
    }

    return fields;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Parse Word document and extract form fields
 */
async function parseWord(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    // Simple extraction: look for common form field patterns
    const fields = [];
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      // Look for field-like patterns (e.g., "Full Name:", "Email:", etc.)
      const fieldMatch = line.match(/^([^:]+):\s*(.*)$/);
      if (fieldMatch) {
        const label = fieldMatch[1].trim();
        const fieldType = inferFieldType(label);
        
        fields.push({
          id: `field_${index + 1}`,
          name: label.toLowerCase().replace(/\s+/g, '_'),
          label: label,
          type: fieldType,
          required: false,
        });
      }
    });

    // If no fields found, create fields from lines that look like form fields
    if (fields.length === 0) {
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 0 && trimmed.length < 50) {
          const fieldType = inferFieldType(trimmed);
          fields.push({
            id: `field_${index + 1}`,
            name: trimmed.toLowerCase().replace(/\s+/g, '_'),
            label: trimmed,
            type: fieldType,
            required: false,
          });
        }
      });
    }

    return fields;
  } catch (error) {
    throw new Error(`Failed to parse Word file: ${error.message}`);
  }
}

/**
 * Parse PDF file and extract form fields
 */
async function parsePDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const fields = [];
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      // Look for field-like patterns
      const fieldMatch = line.match(/^([^:]+):\s*(.*)$/);
      if (fieldMatch) {
        const label = fieldMatch[1].trim();
        const fieldType = inferFieldType(label);
        
        fields.push({
          id: `field_${index + 1}`,
          name: label.toLowerCase().replace(/\s+/g, '_'),
          label: label,
          type: fieldType,
          required: false,
        });
      } else {
        // Check if line looks like a form field
        const trimmed = line.trim();
        if (trimmed.length > 0 && trimmed.length < 50 && !trimmed.match(/^\d+$/)) {
          const fieldType = inferFieldType(trimmed);
          fields.push({
            id: `field_${index + 1}`,
            name: trimmed.toLowerCase().replace(/\s+/g, '_'),
            label: trimmed,
            type: fieldType,
            required: false,
          });
        }
      }
    });

    return fields;
  } catch (error) {
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
}

/**
 * Infer field type from label/name
 */
function inferFieldType(label) {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('email')) return 'email';
  if (lowerLabel.includes('phone') || lowerLabel.includes('tel')) return 'tel';
  if (lowerLabel.includes('date') || lowerLabel.includes('dob') || lowerLabel.includes('birth')) return 'date';
  if (lowerLabel.includes('age') || lowerLabel.includes('number') || lowerLabel.includes('count') || lowerLabel.includes('size')) return 'number';
  if (lowerLabel.includes('select') || lowerLabel.includes('choose') || lowerLabel.includes('dropdown')) return 'select';
  if (lowerLabel.includes('checkbox') || lowerLabel.includes('check')) return 'checkbox';
  if (lowerLabel.includes('radio')) return 'radio';
  if (lowerLabel.includes('note') || lowerLabel.includes('comment') || lowerLabel.includes('description')) return 'textarea';
  if (lowerLabel.includes('file') || lowerLabel.includes('document') || lowerLabel.includes('upload')) return 'file';
  if (lowerLabel.includes('address') || lowerLabel.includes('street') || lowerLabel.includes('city') || lowerLabel.includes('zip') || lowerLabel.includes('state')) return 'text';
  
  return 'text'; // Default to text
}

/**
 * Main parser function - routes to appropriate parser based on file type
 */
async function parseFile(filePath, fileType) {
  switch (fileType) {
    case 'excel':
      return await parseExcel(filePath);
    case 'word':
      return await parseWord(filePath);
    case 'pdf':
      return await parsePDF(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = {
  parseFile,
  parseExcel,
  parseWord,
  parsePDF,
};
