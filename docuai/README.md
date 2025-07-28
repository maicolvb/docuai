# DocuAI - Intelligent Customs Document Analyzer

🛃 A powerful AI-powered application for analyzing customs and trade documents using Claude AI and Streamlit.

## Overview

DocuAI is an intelligent document analysis tool designed specifically for customs and international trade professionals. It leverages Claude AI's advanced vision and text processing capabilities to extract, analyze, and validate information from various customs documents.

## Features

### 🔍 Document Analysis
- **Multi-format Support**: PDF, PNG, JPG, JPEG files
- **Intelligent OCR**: Advanced text extraction from images and PDFs
- **Structured Data Extraction**: Comprehensive information parsing
- **Compliance Checking**: Automated validation and completeness scoring

### 📋 Supported Document Types
- Commercial Invoice
- Bill of Lading
- Packing List
- Certificate of Origin
- Customs Declaration
- Shipping Manifest
- Insurance Certificate
- Import/Export License
- Other Trade Documents

### 📊 Extracted Information
- **Document Details**: Numbers, dates, issuing authorities
- **Trading Parties**: Exporter, importer, consignee information
- **Shipment Details**: Ports, dates, vessel information, terms
- **Product Information**: Descriptions, quantities, values, HS codes
- **Financial Summary**: Costs, charges, totals, currencies
- **Compliance Analysis**: Missing fields, issues, recommendations

### 🎨 User Interface
- **Professional Design**: Clean, intuitive interface
- **Real-time Preview**: Document visualization before analysis
- **Progress Tracking**: Live analysis status updates
- **Export Options**: JSON download and clipboard copy
- **Responsive Layout**: Works on desktop and mobile

## Installation

### Prerequisites
- Python 3.7 or higher
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd docuai
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API Key**
   
   Choose one of the following methods:
   
   **Option A: Streamlit Secrets (Recommended)**
   ```bash
   mkdir .streamlit
   echo 'CLAUDE_API_KEY = "your-api-key-here"' > .streamlit/secrets.toml
   ```
   
   **Option B: Environment Variable**
   ```bash
   # Windows
   set CLAUDE_API_KEY=your-api-key-here
   
   # macOS/Linux
   export CLAUDE_API_KEY=your-api-key-here
   ```
   
   **Option C: Enter in App**
   - Launch the app and enter your API key in the sidebar

5. **Run the application**
   ```bash
   streamlit run docuai.py
   ```

6. **Access the app**
   - Open your browser to `http://localhost:8501`
   - Upload a document and start analyzing!

## Usage

### Basic Workflow

1. **Select Document Type**
   - Choose the appropriate document category from the sidebar
   - This helps the AI understand the expected structure

2. **Upload Document**
   - Click "Choose a file" and select your document
   - Supported formats: PDF, PNG, JPG, JPEG
   - Maximum file size: 200MB

3. **Review Preview**
   - Check the document preview to ensure proper upload
   - Verify file information (size, type, dimensions)

4. **Analyze Document**
   - Click "Analyze Document" to start AI processing
   - Watch the progress indicator for real-time status

5. **Review Results**
   - Examine extracted information across all sections
   - Check compliance analysis and recommendations
   - Note any missing fields or potential issues

6. **Export Data**
   - Download results as JSON for record keeping
   - Copy to clipboard for integration with other systems

### Advanced Features

- **High Accuracy Mode**: Enable for more detailed analysis
- **Batch Processing**: Analyze multiple documents sequentially
- **Compliance Scoring**: 10-point scale for document completeness
- **Error Handling**: Robust handling of API errors and file issues

## File Structure

```
docuai/
├── docuai.py           # Main Streamlit application
├── adufacil.py         # Alternative version with simplified UI
├── requirements.txt    # Python dependencies
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── .streamlit/        # Streamlit configuration (create manually)
    └── secrets.toml   # API key storage (create manually)
```

## Dependencies

- **streamlit**: Web application framework
- **anthropic**: Claude AI API client
- **PyPDF2**: PDF text extraction
- **Pillow**: Image processing
- **pytesseract**: OCR capabilities (optional)

## API Usage and Costs

DocuAI uses Claude AI's API, which has usage-based pricing:
- Text analysis: ~$0.003 per 1K tokens
- Image analysis: ~$0.012 per image
- Typical document analysis: $0.05-$0.20 per document

Monitor your usage in the [Anthropic Console](https://console.anthropic.com/).

## Troubleshooting

### Common Issues

**API Key Errors**
- Verify your API key is correct
- Check that you have sufficient credits
- Ensure the key has proper permissions

**File Upload Issues**
- Check file size (max 200MB)
- Verify file format is supported
- Try converting to PDF if having issues

**PDF Text Extraction**
- Some PDFs may be image-based and require OCR
- Try uploading as an image instead
- Ensure PDF is not corrupted

**Poor Analysis Results**
- Use high-resolution images
- Ensure text is clearly visible
- Try different document types if unsure

### Getting Help

1. Check the in-app help sections
2. Review error messages carefully
3. Verify your API configuration
4. Test with sample documents first

## Contributing

This project is designed for customs and trade document analysis. Contributions that enhance accuracy, add new document types, or improve the user experience are welcome.

## License

This project is for educational and professional use in customs document analysis.

## Acknowledgments

- Powered by [Claude AI](https://www.anthropic.com/) from Anthropic
- Built with [Streamlit](https://streamlit.io/)
- Designed for customs and international trade professionals

---

🛃 **DocuAI** - Making customs document analysis faster, more accurate, and more accessible.