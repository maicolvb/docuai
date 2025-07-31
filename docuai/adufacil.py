import streamlit as st

def authenticate():
    st.title("🔐 Adufacil.ia - Access Restricted")
    st.info("This app is protected. Contact the developer to request access.")

    password = st.text_input("Enter access password:", type="password")
    if password != "demo123":
        st.warning("Access denied. Please contact the developer.")
        st.stop()

authenticate()


import base64
import json
from typing import Dict, Any, Optional
import anthropic
from PIL import Image
import PyPDF2
import io

st.set_page_config(
    page_title="Adufacil.ia - Customs Document Analyzer",
    page_icon="📋",
    layout="wide"
)

def check_api_key() -> Optional[str]:
    """Check if Claude API key is available"""
    api_key = st.secrets.get("CLAUDE_API_KEY") or st.session_state.get("claude_api_key")
    if not api_key:
        st.error("⚠️ Claude API key not found. Please add CLAUDE_API_KEY to your Streamlit secrets or enter it below.")
        api_key = st.text_input("Enter Claude API Key:", type="password", key="api_key_input")
        if api_key:
            st.session_state["claude_api_key"] = api_key
    return api_key

def encode_image(image_file) -> str:
    """Encode image to base64"""
    return base64.b64encode(image_file.read()).decode('utf-8')

def extract_pdf_text(pdf_file) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return ""

def analyze_document(file, document_type: str, api_key: str) -> Dict[str, Any]:
    """Analyze document using Claude API"""
    try:
        client = anthropic.Anthropic(api_key=api_key)
        
        prompt = f"""
        You are an expert customs document analyst. Analyze this {document_type} document and extract the following information in JSON format:

        {{
            "document_number": "Document number or ID",
            "date": "Document date",
            "exporter": {{
                "name": "Exporter company name",
                "address": "Exporter address",
                "country": "Exporter country"
            }},
            "importer": {{
                "name": "Importer company name", 
                "address": "Importer address",
                "country": "Importer country"
            }},
            "products": [
                {{
                    "description": "Product description",
                    "quantity": "Quantity",
                    "unit": "Unit of measure",
                    "unit_value": "Unit value",
                    "total_value": "Total value",
                    "hs_code": "HS/Tariff code if available"
                }}
            ],
            "total_value": "Total shipment value",
            "currency": "Currency used",
            "compliance_issues": [
                "List any potential compliance issues, missing information, or red flags"
            ],
            "additional_notes": "Any other relevant information"
        }}

        Please be thorough and accurate. If information is not clearly visible, indicate "Not clearly visible" or "N/A".
        """

        if file.type == "application/pdf":
            pdf_text = extract_pdf_text(file)
            message = client.messages.create(
                model="claude-3-haiku-20240626",
                max_tokens=4000,
                messages=[{
                    "role": "user",
                    "content": f"{prompt}\n\nDocument text:\n{pdf_text}"
                }]
            )
        else:
            image_base64 = encode_image(file)
            message = client.messages.create(
                model="claude-3-haiku-20240626",
                max_tokens=4000,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": file.type,
                                "data": image_base64
                            }
                        }
                    ]
                }]
            )
        
        response_text = message.content[0].text
        
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except:
            return {"error": "Failed to parse AI response", "raw_response": response_text}
            
    except Exception as e:
        return {"error": f"API Error: {str(e)}"}

def display_analysis_results(results: Dict[str, Any]):
    """Display analysis results in structured format"""
    if "error" in results:
        st.error(f"Analysis Error: {results['error']}")
        if "raw_response" in results:
            st.text_area("Raw AI Response:", results["raw_response"], height=200)
        return

    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📄 Document Information")
        st.write(f"**Document Number:** {results.get('document_number', 'N/A')}")
        st.write(f"**Date:** {results.get('date', 'N/A')}")
        st.write(f"**Total Value:** {results.get('total_value', 'N/A')} {results.get('currency', '')}")
        
        st.subheader("📤 Exporter")
        exporter = results.get('exporter', {})
        st.write(f"**Name:** {exporter.get('name', 'N/A')}")
        st.write(f"**Address:** {exporter.get('address', 'N/A')}")
        st.write(f"**Country:** {exporter.get('country', 'N/A')}")
    
    with col2:
        st.subheader("📥 Importer")
        importer = results.get('importer', {})
        st.write(f"**Name:** {importer.get('name', 'N/A')}")
        st.write(f"**Address:** {importer.get('address', 'N/A')}")
        st.write(f"**Country:** {importer.get('country', 'N/A')}")
    
    st.subheader("📦 Products")
    products = results.get('products', [])
    if products:
        for i, product in enumerate(products, 1):
            with st.expander(f"Product {i}: {product.get('description', 'Unknown')}"):
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write(f"**Quantity:** {product.get('quantity', 'N/A')} {product.get('unit', '')}")
                    st.write(f"**Unit Value:** {product.get('unit_value', 'N/A')}")
                with col2:
                    st.write(f"**Total Value:** {product.get('total_value', 'N/A')}")
                    st.write(f"**HS Code:** {product.get('hs_code', 'N/A')}")
    else:
        st.write("No products found")
    
    compliance_issues = results.get('compliance_issues', [])
    if compliance_issues and compliance_issues != ['N/A']:
        st.subheader("⚠️ Compliance Issues")
        for issue in compliance_issues:
            if issue and issue != 'N/A':
                st.warning(f"• {issue}")
    
    additional_notes = results.get('additional_notes', '')
    if additional_notes and additional_notes != 'N/A':
        st.subheader("📝 Additional Notes")
        st.info(additional_notes)

def main():
    st.title("📋 Adufacil.ia - Customs Document Analyzer")
    st.markdown("### Intelligent analysis of customs documents using Claude AI")
    
    api_key = check_api_key()
    if not api_key:
        st.stop()
    
    st.markdown("---")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📁 Upload Document")
        uploaded_file = st.file_uploader(
            "Choose a file",
            type=['pdf', 'png', 'jpg', 'jpeg'],
            help="Upload PDF, PNG, or JPG files"
        )
    
    with col2:
        st.subheader("📋 Document Type")
        document_type = st.selectbox(
            "Select document type:",
            ["Commercial Invoice", "Bill of Lading", "Customs Declaration"],
            help="Select the type of customs document"
        )
    
    if uploaded_file is not None:
        st.markdown("---")
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.subheader("📄 Document Preview")
            if uploaded_file.type == "application/pdf":
                st.write("📄 PDF Document uploaded")
                st.write(f"**Filename:** {uploaded_file.name}")
                st.write(f"**Size:** {uploaded_file.size:,} bytes")
            else:
                image = Image.open(uploaded_file)
                st.image(image, caption=uploaded_file.name, use_column_width=True)
        
        with col2:
            st.subheader("🔍 Analysis")
            
            if st.button("🚀 Analyze Document", type="primary"):
                with st.spinner("Analyzing document with Claude AI..."):
                    uploaded_file.seek(0)
                    results = analyze_document(uploaded_file, document_type, api_key)
                    
                    st.markdown("---")
                    st.subheader("📊 Analysis Results")
                    display_analysis_results(results)

if __name__ == "__main__":
    main()
