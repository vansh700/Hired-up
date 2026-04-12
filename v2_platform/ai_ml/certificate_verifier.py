import re
import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urlparse
import numpy as np

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

try:
    import cv2
    from PIL import Image, ImageChops, ImageEnhance
except ImportError:
    cv2 = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None


PLATFORMS = ['coursera', 'udemy', 'edx', 'google']

def extract_pdf_metadata(file_path: str) -> dict:
    """Extract metadata from PDF certificate."""
    if not PdfReader:
        return {}
    try:
        reader = PdfReader(file_path)
        info = reader.metadata or {}
        text = ""
        for page in reader.pages[:3]:
            text += page.extract_text() or ""
        
        # Enhanced metadata check for editing tools
        creator = (getattr(info, 'creator', None) or info.get('/Creator') or "").lower()
        producer = (getattr(info, 'producer', None) or info.get('/Producer') or "").lower()
        
        editing_tools = ['photoshop', 'canva', 'illustrator', 'gimp', 'inkscape', 'nitro', 'foxit']
        is_edited = any(tool in creator or tool in producer for tool in editing_tools)

        return {
            "title": getattr(info, 'title', None) or info.get('/Title'),
            "author": getattr(info, 'author', None) or info.get('/Author'),
            "subject": getattr(info, 'subject', None) or info.get('/Subject'),
            "creator": creator,
            "producer": producer,
            "is_edited_tool_signature": is_edited,
            "text_sample": text[:2000],
        }
    except Exception as e:
        return {"error": str(e)}

def perform_ela(image_path: str, quality: int = 90) -> float:
    """
    Perform Error Level Analysis (ELA) to detect image tampering.
    Returns a 'suspicion_score' (0-100).
    """
    if not cv2: return 0.0
    
    try:
        filename = image_path
        resaved_filename = image_path + '.resaved.jpg'
        
        im = Image.open(filename).convert('RGB')
        im.save(resaved_filename, 'JPEG', quality=quality)
        
        resaved_im = Image.open(resaved_filename)
        ela_im = ImageChops.difference(im, resaved_im)
        
        extrema = ela_im.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0: max_diff = 1
        
        scale = 255.0 / max_diff
        ela_im = ImageEnhance.Brightness(ela_im).enhance(scale)
        
        # Calculate mean brightness - higher values in tampered areas usually increase mean
        # We also look for localized high-variance regions (implementation simplified for MVP)
        stats = np.array(ela_im).mean()
        
        os.remove(resaved_filename)
        
        # Heuristic: naturally compressed images have lower mean diffs
        # Tampered regions (different compression) show up as bright spots
        return min(100, stats * 2.5) 
    except Exception:
        return 0.0

def extract_text_advanced(file_path: str) -> str:
    """Try OCR if text extraction fails."""
    text = ""
    # 1. try basic PDF extraction
    if file_path.lower().endswith('.pdf') and PdfReader:
        try:
            reader = PdfReader(file_path)
            for page in reader.pages[:3]:
                text += page.extract_text() or ""
        except: pass
        
    # 2. try OCR if text is sparse or it's an image
    if len(text.strip()) < 50 and pytesseract:
        try:
            if file_path.lower().endswith('.pdf') and convert_from_path:
                images = convert_from_path(file_path, first_page=1, last_page=1)
                if images:
                    text = pytesseract.image_to_string(images[0])
            else:
                text = pytesseract.image_to_string(Image.open(file_path))
        except: pass
        
    return text

def detect_platform(text: str, metadata: dict, url: str = None) -> str:
    """Detect platform from text, metadata or URL."""
    creators = (metadata.get("creator", "") or "").lower()
    producers = (metadata.get("producer", "") or "").lower()
    title = (metadata.get("title", "") or "").lower()

    combined = f"{text.lower()} {creators} {producers} {title} {(url or '').lower()}"

    if "coursera" in combined: return "coursera"
    if "udemy" in combined: return "udemy"
    if "edx" in combined: return "edx"
    if "google" in combined: return "google"
    
    return "unknown"

def verify_certificate(file_path: str = None, url: str = None) -> dict:
    """
    AI-powered certificate verification with fraud detection.
    """
    if not file_path and not url:
        return {"error": "Missing input", "status": "FAILED"}

    results = {
        "platform": "unknown",
        "trust_score": 0,
        "status": "UNVERIFIABLE",
        "fraud_detection": {
            "tampering_detected": False,
            "ela_score": 0,
            "metadata_flag": False,
            "reasons": []
        },
        "extracted_fields": {
            "name": None,
            "id": None,
            "date": None
        }
    }

    metadata = {}
    full_text = ""
    
    # 1. Extraction & Pre-processing
    if file_path and Path(file_path).exists():
        metadata = extract_pdf_metadata(file_path)
        full_text = extract_text_advanced(file_path)
        
        # 2. Image Forensics (only for images or converted PDFs)
        temp_img_path = None
        if file_path.lower().endswith('.pdf') and convert_from_path:
            try:
                pages = convert_from_path(file_path, first_page=1, last_page=1)
                if pages:
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tf:
                        pages[0].save(tf.name, 'JPEG')
                        temp_img_path = tf.name
            except: pass
        else:
            temp_img_path = file_path
            
        if temp_img_path:
            ela_score = perform_ela(temp_img_path)
            results["fraud_detection"]["ela_score"] = round(ela_score, 2)
            if ela_score > 40:
                results["fraud_detection"]["tampering_detected"] = True
                results["fraud_detection"]["reasons"].append("Image forensics suggests pixel-level tampering (ELA mismatch)")
            
            if temp_img_path != file_path and temp_img_path:
                try: os.remove(temp_img_path)
                except: pass
    elif url:
        full_text = url
        metadata = {"text_sample": url}

    # 3. Platform Detection
    platform = detect_platform(full_text, metadata, url)
    results["platform"] = platform

    # 4. Field Extraction (Regex)
    # Name pattern: "Certificate of Completion to [Name]" or "Presented to [Name]"
    name_match = re.search(r'(?:to|presented to|awarded to|this is to certify that)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', full_text, re.IGNORECASE)
    if name_match: results["extracted_fields"]["name"] = name_match.group(1).strip()
    
    # ID pattern: XXXX-XXXX or alphanumeric combinations
    id_match = re.search(r'(?:Certificate ID|Credential ID|Verify at|ID:)\s*([a-zA-Z0-9-]{8,})', full_text, re.IGNORECASE)
    if id_match: results["extracted_fields"]["id"] = id_match.group(1).strip()
    
    # Date pattern
    date_match = re.search(r'([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', full_text)
    if date_match: results["extracted_fields"]["date"] = date_match.group(1).strip()

    # 5. Metadata Scoring
    if metadata.get("is_edited_tool_signature"):
        results["fraud_detection"]["metadata_flag"] = True
        results["fraud_detection"]["reasons"].append(f"Document created using editing software ({metadata.get('creator', 'unknown')})")

    # 6. Final Trust Calculation
    base_score = 0
    if results["extracted_fields"]["name"]: base_score += 20
    if results["extracted_fields"]["id"]: base_score += 30
    if results["extracted_fields"]["date"]: base_score += 10
    if platform != "unknown": base_score += 20
    if len(full_text) > 200: base_score += 20
    
    # Penalty for fraud signals
    penalty = 0
    if results["fraud_detection"]["tampering_detected"]: penalty += 40
    if results["fraud_detection"]["metadata_flag"]: penalty += 20
    
    final_score = max(0, base_score - penalty)
    results["trust_score"] = final_score
    
    if final_score >= 70: results["status"] = "VERIFIED"
    elif final_score >= 40: results["status"] = "SUSPICIOUS"
    else: results["status"] = "FAILED"
    
    return results
