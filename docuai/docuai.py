import streamlit as st
import base64
import json
from typing import Dict, Any, Optional, List
import anthropic
from PIL import Image
import PyPDF2
import io
import time
from datetime import datetime

st.set_page_config(
    page_title="DocuAI - Intelligent Customs Document Analyzer",
    page_icon="🛃",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1e3a8a;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        text-align: center;
        color: #64748b;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .success-card {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .warning-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .info-box {
        background: #f8fafc;
        border-left: 4px solid #3b82f6;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 0 8px 8px 0;
    }
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #667eea, #764ba2);
    }
</style>
""", unsafe_allow_html=True)

class DocuAI:
    def __init__(self):
        self.supported_formats = ['pdf', 'png', 'jpg', 'jpeg']
        self.document_types = [
            "Commercial Invoice",
            "Bill of Lading", 
            "Packing List",
            "Certificate of Origin",
            "Customs Declaration",
            "Shipping Manifest",
            "Insurance Certificate",
            "Import/Export License",
            "Other Trade Document"
        ]
    
    def check_api_key(self) -> Optional[str]:
        """Check if Claude API key is available with better UX"""
        api_key = None
        
        # Check multiple sources for API key
        if "CLAUDE_API_KEY" in st.secrets:
            api_key = st.secrets["CLAUDE_API_KEY"]
        elif "claude_api_key" in st.session_state:
            api_key = st.session_state["claude_api_key"]
        
        if not api_key:
            st.sidebar.markdown("### 🔑 API Configuration")
            st.sidebar.error("Claude API key required to analyze documents")
            
            with st.sidebar.expander("How to get your API key"):
                st.markdown("""
                1. Visit [Claude Console](https://console.anthropic.com/)
                2. Create an account or sign in
                3. Navigate to API Keys section
                4. Generate a new API key
                5. Copy and paste it below
                """)
            
            api_key = st.sidebar.text_input(
                "Enter Claude API Key:", 
                type="password", 
                key="api_key_input",
                help="Your API key will be stored securely for this session"
            )
            
            if api_key:
                st.session_state["claude_api_key"] = api_key
                st.sidebar.success("✅ API key configured successfully!")
                st.rerun()
        else:
            st.sidebar.success("✅ API key configured")
            
        return api_key

    def encode_image(self, image_file) -> str:
        """Encode image to base64"""
        try:
            image_file.seek(0)
            return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            st.error(f"Error encoding image: {str(e)}")
            return ""

    def extract_pdf_text(self, pdf_file) -> str:
        """Extract text from PDF file with better error handling"""
        try:
            pdf_file.seek(0)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            if len(pdf_reader.pages) == 0:
                raise ValueError("PDF file appears to be empty or corrupted")
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                except Exception as e:
                    st.warning(f"Could not extract text from page {page_num + 1}: {str(e)}")
            
            if not text.strip():
                raise ValueError("No text could be extracted from the PDF")
                
            return text
            
        except Exception as e:
            st.error(f"Error reading PDF: {str(e)}")
            return ""

    def analyze_document(self, file, document_type: str, api_key: str) -> Dict[str, Any]:
        """Analyze document using Claude API with enhanced prompting"""
        try:
            client = anthropic.Anthropic(api_key=api_key)
            
            # Enhanced prompt with specific instructions for different document types
            base_prompt = f"""
            You are an expert customs and trade document analyst with deep knowledge of international trade regulations and documentation requirements. 

            Analyze this {document_type} document and extract comprehensive information in the following JSON format:

            {{
                "document_info": {{
                    "document_type": "{document_type}",
                    "document_number": "Document number/reference ID",
                    "issue_date": "Date of issuance (YYYY-MM-DD format)",
                    "validity_date": "Expiry/validity date if applicable",
                    "issuing_authority": "Authority or organization that issued the document"
                }},
                "parties": {{
                    "exporter": {{
                        "name": "Full company name",
                        "address": "Complete address",
                        "country": "Country",
                        "tax_id": "Tax ID/VAT number if available",
                        "contact": "Phone/email if available"
                    }},
                    "importer": {{
                        "name": "Full company name",
                        "address": "Complete address", 
                        "country": "Country",
                        "tax_id": "Tax ID/VAT number if available",
                        "contact": "Phone/email if available"
                    }},
                    "consignee": {{
                        "name": "Consignee if different from importer",
                        "address": "Address",
                        "country": "Country"
                    }}
                }},
                "shipment_details": {{
                    "origin_port": "Port/place of loading",
                    "destination_port": "Port/place of discharge",
                    "departure_date": "Departure date",
                    "arrival_date": "Expected/actual arrival date",
                    "vessel_name": "Ship/flight/vehicle name",
                    "container_numbers": ["List of container numbers"],
                    "shipping_terms": "Incoterms (FOB, CIF, etc.)"
                }},
                "products": [
                    {{
                        "item_number": "Line item number",
                        "description": "Detailed product description",
                        "quantity": "Quantity with units",
                        "unit_price": "Price per unit",
                        "total_value": "Total line value",
                        "currency": "Currency code",
                        "hs_code": "Harmonized System code",
                        "country_of_origin": "Manufacturing country",
                        "weight_gross": "Gross weight",
                        "weight_net": "Net weight",
                        "packaging": "Packaging details"
                    }}
                ],
                "financial_summary": {{
                    "subtotal": "Goods value before charges",
                    "freight_charges": "Shipping costs",
                    "insurance": "Insurance amount",
                    "other_charges": "Other fees/charges",
                    "total_value": "Grand total",
                    "currency": "Primary currency",
                    "exchange_rate": "Exchange rate if applicable"
                }},
                "compliance_analysis": {{
                    "completeness_score": "Score from 1-10 for document completeness",
                    "missing_fields": ["List of critical missing information"],
                    "potential_issues": ["Compliance concerns or red flags"],
                    "recommendations": ["Suggestions for improvement"],
                    "regulatory_notes": ["Relevant trade regulations or requirements"]
                }},
                "quality_indicators": {{
                    "document_clarity": "Assessment of document readability",
                    "data_consistency": "Check for contradictory information",
                    "standard_compliance": "Adherence to international standards"
                }}
            }}

            IMPORTANT INSTRUCTIONS:
            - If information is not clearly visible or available, use "Not available" or "N/A"
            - For numerical values, include the currency symbol and amount
            - Dates should be in YYYY-MM-DD format when possible
            - Be especially careful with HS codes - only include if clearly stated
            - Flag any suspicious patterns or potential compliance issues
            - Consider the specific requirements for {document_type} documents
            - Provide confidence level for extracted data when uncertain
            """

            # Process based on file type
            if file.type == "application/pdf":
                pdf_text = self.extract_pdf_text(file)
                if not pdf_text:
                    return {"error": "Could not extract text from PDF file"}
                
                message = client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=4000,
                    temperature=0.1,
                    messages=[{
                        "role": "user",
                        "content": f"{base_prompt}\n\nDocument text content:\n{pdf_text}"
                    }]
                )
            else:
                # Handle image files
                image_base64 = self.encode_image(file)
                if not image_base64:
                    return {"error": "Could not process image file"}
                
                message = client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=4000,
                    temperature=0.1,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": base_prompt},
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
            
            # Parse JSON response
            try:
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start == -1 or json_end == 0:
                    return {"error": "No valid JSON found in response", "raw_response": response_text}
                
                json_str = response_text[json_start:json_end]
                result = json.loads(json_str)
                result["_analysis_timestamp"] = datetime.now().isoformat()
                result["_api_usage"] = {
                    "model": "claude-3-sonnet-20240229",
                    "input_tokens": message.usage.input_tokens,
                    "output_tokens": message.usage.output_tokens
                }
                return result
                
            except json.JSONDecodeError as e:
                return {
                    "error": f"Failed to parse AI response: {str(e)}", 
                    "raw_response": response_text
                }
                
        except anthropic.AuthenticationError:
            return {"error": "Invalid API key. Please check your Claude API key."}
        except anthropic.RateLimitError:
            return {"error": "Rate limit exceeded. Please wait a moment and try again."}
        except anthropic.APIError as e:
            return {"error": f"Claude API error: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}

    def display_analysis_results(self, results: Dict[str, Any], file_name: str):
        """Display comprehensive analysis results"""
        if "error" in results:
            st.error(f"❌ Analysis Failed: {results['error']}")
            if "raw_response" in results:
                with st.expander("🔍 View Raw AI Response"):
                    st.text_area("Raw Response:", results["raw_response"], height=300)
            return

        # Header with file info
        st.markdown(f"### 📋 Analysis Results for: `{file_name}`")
        
        if "_analysis_timestamp" in results:
            st.caption(f"🕒 Analyzed on: {results['_analysis_timestamp']}")

        # Document Information Section
        doc_info = results.get('document_info', {})
        if doc_info:
            st.markdown("#### 📄 Document Information")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.markdown(f"**Type:** {doc_info.get('document_type', 'N/A')}")
                st.markdown(f"**Number:** {doc_info.get('document_number', 'N/A')}")
            with col2:
                st.markdown(f"**Issue Date:** {doc_info.get('issue_date', 'N/A')}")
                st.markdown(f"**Validity:** {doc_info.get('validity_date', 'N/A')}")
            with col3:
                st.markdown(f"**Issuing Authority:** {doc_info.get('issuing_authority', 'N/A')}")

        # Parties Information
        parties = results.get('parties', {})
        if parties:
            st.markdown("#### 👥 Trading Parties")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("##### 📤 Exporter")
                exporter = parties.get('exporter', {})
                st.markdown(f"**Company:** {exporter.get('name', 'N/A')}")
                st.markdown(f"**Address:** {exporter.get('address', 'N/A')}")
                st.markdown(f"**Country:** {exporter.get('country', 'N/A')}")
                if exporter.get('tax_id', 'N/A') != 'N/A':
                    st.markdown(f"**Tax ID:** {exporter.get('tax_id')}")
            
            with col2:
                st.markdown("##### 📥 Importer")
                importer = parties.get('importer', {})
                st.markdown(f"**Company:** {importer.get('name', 'N/A')}")
                st.markdown(f"**Address:** {importer.get('address', 'N/A')}")
                st.markdown(f"**Country:** {importer.get('country', 'N/A')}")
                if importer.get('tax_id', 'N/A') != 'N/A':
                    st.markdown(f"**Tax ID:** {importer.get('tax_id')}")

        # Shipment Details
        shipment = results.get('shipment_details', {})
        if shipment and any(v != 'N/A' for v in shipment.values() if isinstance(v, str)):
            st.markdown("#### 🚢 Shipment Details")
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown(f"**Origin:** {shipment.get('origin_port', 'N/A')}")
                st.markdown(f"**Destination:** {shipment.get('destination_port', 'N/A')}")
            with col2:
                st.markdown(f"**Departure:** {shipment.get('departure_date', 'N/A')}")
                st.markdown(f"**Arrival:** {shipment.get('arrival_date', 'N/A')}")
            with col3:
                st.markdown(f"**Vessel:** {shipment.get('vessel_name', 'N/A')}")
                st.markdown(f"**Terms:** {shipment.get('shipping_terms', 'N/A')}")

        # Financial Summary
        financial = results.get('financial_summary', {})
        if financial:
            st.markdown("#### 💰 Financial Summary")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Subtotal", f"{financial.get('subtotal', 'N/A')} {financial.get('currency', '')}")
            with col2:
                st.metric("Freight", f"{financial.get('freight_charges', 'N/A')} {financial.get('currency', '')}")
            with col3:
                st.metric("Insurance", f"{financial.get('insurance', 'N/A')} {financial.get('currency', '')}")
            with col4:
                st.metric("Total Value", f"{financial.get('total_value', 'N/A')} {financial.get('currency', '')}")

        # Products Section
        products = results.get('products', [])
        if products:
            st.markdown("#### 📦 Products")
            
            for i, product in enumerate(products, 1):
                with st.expander(f"Item {i}: {product.get('description', 'Unknown Product')}"):
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.markdown(f"**Quantity:** {product.get('quantity', 'N/A')}")
                        st.markdown(f"**Unit Price:** {product.get('unit_price', 'N/A')} {product.get('currency', '')}")
                        st.markdown(f"**Total Value:** {product.get('total_value', 'N/A')} {product.get('currency', '')}")
                    
                    with col2:
                        st.markdown(f"**HS Code:** {product.get('hs_code', 'N/A')}")
                        st.markdown(f"**Origin:** {product.get('country_of_origin', 'N/A')}")
                        st.markdown(f"**Packaging:** {product.get('packaging', 'N/A')}")
                    
                    with col3:
                        st.markdown(f"**Gross Weight:** {product.get('weight_gross', 'N/A')}")
                        st.markdown(f"**Net Weight:** {product.get('weight_net', 'N/A')}")

        # Compliance Analysis
        compliance = results.get('compliance_analysis', {})
        if compliance:
            st.markdown("#### ⚖️ Compliance Analysis")
            
            # Completeness score
            score = compliance.get('completeness_score', 'N/A')
            if score != 'N/A':
                try:
                    score_num = float(score.split('/')[0]) if '/' in str(score) else float(score)
                    score_pct = score_num / 10.0
                    st.progress(score_pct)
                    st.markdown(f"**Completeness Score:** {score}/10")
                except:
                    st.markdown(f"**Completeness Score:** {score}")
            
            # Issues and recommendations
            col1, col2 = st.columns(2)
            
            with col1:
                missing_fields = compliance.get('missing_fields', [])
                if missing_fields and missing_fields != ['N/A']:
                    st.markdown("**⚠️ Missing Information:**")
                    for field in missing_fields:
                        if field and field != 'N/A':
                            st.warning(f"• {field}")
                
                potential_issues = compliance.get('potential_issues', [])
                if potential_issues and potential_issues != ['N/A']:
                    st.markdown("**🚨 Potential Issues:**")
                    for issue in potential_issues:
                        if issue and issue != 'N/A':
                            st.error(f"• {issue}")
            
            with col2:
                recommendations = compliance.get('recommendations', [])
                if recommendations and recommendations != ['N/A']:
                    st.markdown("**💡 Recommendations:**")
                    for rec in recommendations:
                        if rec and rec != 'N/A':
                            st.info(f"• {rec}")

        # Export functionality
        st.markdown("#### 📁 Export Results")
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("📋 Copy JSON to Clipboard", help="Copy the full analysis results as JSON"):
                json_str = json.dumps(results, indent=2, ensure_ascii=False)
                st.code(json_str, language="json")
        
        with col2:
            # Download JSON
            json_str = json.dumps(results, indent=2, ensure_ascii=False)
            st.download_button(
                label="📥 Download JSON Report",
                data=json_str,
                file_name=f"docuai_analysis_{file_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )

def main():
    # Initialize DocuAI
    docuai = DocuAI()
    
    # Header
    st.markdown('<div class="main-header">🛃 DocuAI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Intelligent Customs Document Analyzer powered by Claude AI</div>', unsafe_allow_html=True)
    
    # Check API key
    api_key = docuai.check_api_key()
    if not api_key:
        st.stop()
    
    # Sidebar configuration
    with st.sidebar:
        st.markdown("### ⚙️ Configuration")
        
        # Document type selection
        document_type = st.selectbox(
            "📋 Document Type:",
            docuai.document_types,
            help="Select the type of customs document you're analyzing"
        )
        
        # Processing options
        st.markdown("### 🔧 Processing Options")
        use_high_accuracy = st.checkbox(
            "High Accuracy Mode", 
            value=True, 
            help="Uses more detailed analysis (may take longer)"
        )
        
        # Help section
        with st.expander("❓ How to Use"):
            st.markdown("""
            1. **Select Document Type** - Choose the appropriate document category
            2. **Upload File** - Support for PDF, PNG, JPG formats
            3. **Click Analyze** - AI will extract all relevant information
            4. **Review Results** - Check compliance and completeness
            5. **Export Data** - Download results as JSON
            """)
        
        with st.expander("📚 Supported Documents"):
            for doc_type in docuai.document_types:
                st.markdown(f"• {doc_type}")

    # Main content area
    st.markdown("---")
    
    # File upload section
    st.markdown("### 📁 Upload Document")
    
    uploaded_file = st.file_uploader(
        "Choose a customs document file",
        type=docuai.supported_formats,
        help="Upload PDF, PNG, or JPG files (max 200MB)"
    )
    
    if uploaded_file is not None:
        # File information
        file_size_mb = uploaded_file.size / (1024 * 1024)
        st.info(f"📄 **File:** {uploaded_file.name} | **Size:** {file_size_mb:.2f} MB | **Type:** {uploaded_file.type}")
        
        # Display file preview
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.markdown("#### 👁️ Document Preview")
            
            if uploaded_file.type == "application/pdf":
                st.markdown("📄 **PDF Document**")
                st.markdown("*Preview not available for PDF files*")
                
                # Show basic PDF info
                try:
                    uploaded_file.seek(0)
                    pdf_reader = PyPDF2.PdfReader(uploaded_file)
                    st.markdown(f"**Pages:** {len(pdf_reader.pages)}")
                except:
                    st.warning("Could not read PDF metadata")
            else:
                try:
                    image = Image.open(uploaded_file)
                    st.image(image, caption=uploaded_file.name, use_column_width=True)
                    st.markdown(f"**Dimensions:** {image.size[0]} x {image.size[1]} pixels")
                except Exception as e:
                    st.error(f"Could not display image: {str(e)}")
        
        with col2:
            st.markdown("#### 🚀 Analysis")
            st.markdown(f"**Selected Document Type:** {document_type}")
            
            if st.button("🔍 Analyze Document", type="primary", use_container_width=True):
                # Show progress
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                # Analysis steps
                steps = [
                    "Preparing document...",
                    "Connecting to Claude AI...",
                    "Analyzing document content...",
                    "Extracting structured data...",
                    "Performing compliance checks...",
                    "Finalizing results..."
                ]
                
                try:
                    for i, step in enumerate(steps):
                        status_text.text(step)
                        progress_bar.progress((i + 1) / len(steps))
                        time.sleep(0.5)  # Simulate processing time
                    
                    # Actual analysis
                    uploaded_file.seek(0)
                    results = docuai.analyze_document(uploaded_file, document_type, api_key)
                    
                    # Clear progress indicators
                    progress_bar.empty()
                    status_text.empty()
                    
                    # Display results
                    st.markdown("---")
                    docuai.display_analysis_results(results, uploaded_file.name)
                    
                except Exception as e:
                    progress_bar.empty()
                    status_text.empty()
                    st.error(f"Analysis failed: {str(e)}")
    
    else:
        # Show instructions when no file uploaded
        st.markdown("### 📋 Instructions")
        st.markdown("""
        1. **Select the document type** from the sidebar dropdown
        2. **Upload your customs document** using the file uploader above
        3. **Click 'Analyze Document'** to start the AI analysis
        4. **Review the extracted information** and compliance analysis
        5. **Export the results** in JSON format for your records
        """)
        
        # Sample supported documents
        st.markdown("### 📄 Supported Document Types")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("""
            **Trade Documents:**
            - Commercial Invoice
            - Packing List
            - Certificate of Origin
            """)
        
        with col2:
            st.markdown("""
            **Shipping Documents:**
            - Bill of Lading
            - Shipping Manifest
            - Insurance Certificate
            """)
        
        with col3:
            st.markdown("""
            **Regulatory Documents:**
            - Customs Declaration
            - Import/Export License
            - Other Trade Documents
            """)

    # Footer
    st.markdown("---")
    st.markdown(
        "<div style='text-align: center; color: #64748b;'>"
        "🛃 DocuAI - Powered by Claude AI | Built with Streamlit<br>"
        "<small>For professional customs document analysis and compliance checking</small>"
        "</div>", 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()