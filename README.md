<p align="center">
  <a href="https://adufacil-ia.streamlit.app" target="_blank">
    <img src="https://raw.githubusercontent.com/maicolvb/docuai/main/docuai/ADUFACIL_BANNER.png" alt="Adufacil.ia Banner"/>
  </a>
</p>

# 📋 Adufacil.ia - Customs Document Analyzer

> **Intelligent analysis of customs documents using Claude AI**

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.0+-red.svg)](https://streamlit.io/)
[![Claude AI](https://img.shields.io/badge/Claude-AI-orange.svg)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Overview

Adufacil.ia is a sophisticated web application that leverages Claude AI's advanced vision and text processing capabilities to automatically analyze customs documents. The application extracts critical information from commercial invoices, bills of lading, and customs declarations, providing structured analysis and compliance insights.

### ✨ Key Features

- **🔍 Multi-format Support**: Process PDF documents and images (PNG, JPG, JPEG)
- **📊 Intelligent Extraction**: Automatically extracts exporter/importer details, product information, and financial data
- **⚠️ Compliance Analysis**: Identifies potential compliance issues and red flags
- **🎯 Document Types**: Supports Commercial Invoices, Bills of Lading, and Customs Declarations
- **📱 User-friendly Interface**: Clean, intuitive Streamlit-based web interface
- **🔒 Secure Processing**: Local processing with secure API key management

## 🛠️ Installation

### Prerequisites

- Python 3.7 or higher
- Claude API key from Anthropic

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/docuai.git
   cd docuai
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your Claude API key**
   
   Option A: Using Streamlit secrets (recommended)
   ```bash
   mkdir .streamlit
   echo 'CLAUDE_API_KEY = "your-api-key-here"' > .streamlit/secrets.toml
   ```
   
   Option B: Enter API key in the application interface

4. **Run the application**
   ```bash
   streamlit run adufacil.py
   ```

5. **Open your browser** and navigate to `http://localhost:8501`

## 📝 Usage

### Document Analysis Workflow

1. **Upload Document**: Choose a PDF, PNG, or JPG file containing your customs document
2. **Select Type**: Specify whether it's a Commercial Invoice, Bill of Lading, or Customs Declaration
3. **Analyze**: Click "Analyze Document" to process with Claude AI
4. **Review Results**: Get structured information including:
   - Document details (number, date, total value)
   - Exporter and importer information
   - Product breakdown with HS codes
   - Compliance issues and recommendations

### Supported Document Types

| Document Type | Description | Key Information Extracted |
|---------------|-------------|---------------------------|
| **Commercial Invoice** | Itemized list of goods with prices | Product details, pricing, terms |
| **Bill of Lading** | Receipt for cargo shipment | Shipping details, consignee info |
| **Customs Declaration** | Official customs entry form | Duty information, classifications |

## 🏗️ Architecture

```
docuai/
├── adufacil.py           # Main Streamlit application
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

### Core Components

- **Document Processing Engine**: Handles PDF text extraction and image encoding
- **Claude AI Integration**: Leverages Claude-3-Haiku for document analysis
- **Streamlit Interface**: Provides intuitive web-based user experience
- **Compliance Engine**: Identifies potential issues and missing information

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLAUDE_API_KEY` | Your Anthropic Claude API key | Yes |

### Streamlit Configuration

The application uses Streamlit's built-in configuration system. You can customize the interface by modifying the `st.set_page_config()` parameters in `adufacil.py`.

## 📊 Features Deep Dive

### Intelligent Data Extraction

The application uses advanced AI to extract:
- **Entity Information**: Company names, addresses, contact details
- **Financial Data**: Values, currencies, payment terms
- **Product Details**: Descriptions, quantities, HS codes
- **Shipping Information**: Dates, locations, carrier details

### Compliance Analysis

Automated detection of:
- Missing required information
- Inconsistent data across documents
- Potential red flags for customs review
- HS code validation and suggestions

## 🚀 Advanced Usage

### API Integration

While primarily designed as a web application, the core analysis function can be integrated into other systems:

```python
from adufacil import analyze_document

# Analyze a document programmatically
results = analyze_document(file, "Commercial Invoice", api_key)
```

### Batch Processing

For processing multiple documents, you can extend the application or use the core functions in a loop with appropriate rate limiting.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/docuai.git
cd docuai

# Install development dependencies
pip install -r requirements.txt

# Run tests (if available)
python -m pytest

# Start development server
streamlit run adufacil.py
```

## 📋 Requirements

See `requirements.txt` for the full list of dependencies:

- **streamlit**: Web application framework
- **anthropic**: Claude AI API client
- **PyPDF2**: PDF text extraction
- **Pillow**: Image processing
- **pytesseract**: OCR capabilities (if needed)

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Verify your Claude API key is valid
- Check that you have sufficient API credits
- Ensure the key is properly set in secrets or entered in the interface

**PDF Processing Errors**
- Ensure PDF is not password-protected
- Try converting scanned PDFs to searchable text first
- Check file size limits (large files may timeout)

**Image Upload Issues**
- Supported formats: PNG, JPG, JPEG
- Ensure images are clear and readable
- Try reducing image size if upload fails

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for providing the Claude AI API
- **Streamlit** for the excellent web application framework
- **PyPDF2** contributors for PDF processing capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/docuai/issues)
- **Documentation**: This README and inline code comments
- **Community**: Feel free to fork and contribute!

---

<div align="center">
  <strong>Built with ❤️ for customs professionals and trade specialists</strong>
</div>
