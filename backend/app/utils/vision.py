from google.cloud import vision
from google.cloud.vision_v1 import types
from typing import List
from dotenv import load_dotenv
import asyncio


load_dotenv()

HAND_PICKED_LABELS = {
    "graffiti": 1,
    "hole": 2,
    "pothole": 2,
    "street": 1,
    "traffic light": 3,
    "signaling device": 2,
    "traffic sign": 1,
    "road": 1,
    "road surface": 1,
    "asphalt": 1,
    "lamp": 3,
    "sidewalk": 1
}

def score_photo_labels(labels: List[str]) -> int:
    return sum(HAND_PICKED_LABELS.get(label.lower(), 0) for label in labels)

async def get_photo_label_and_score(image_path:str):
    client = vision.ImageAnnotatorClient()
    with open(image_path, "rb") as image_file:
        content = image_file.read()
        
    image = vision.Image(content=content)
    response = client.label_detection(image=image)
    labels = [label.description.lower() for label in response.label_annotations]
    score = score_photo_labels(labels)
    
    response = client.safe_search_detection(image=image)
    safe = response.safe_search_annotation
    
    LIKELY = types.Likelihood.LIKELY
    
    is_inappropriate = (
        getattr(safe, "violence", 0) >= LIKELY or
        getattr(safe, "adult", 0) >= LIKELY
    )
    return labels, score, is_inappropriate

### async def main():
#    test_image_path = 
#    labels, score, is_inappropriate = await get_photo_label_and_score(test_image_path)
#    print(labels)
#    print(score)
#    print(is_inappropriate)
    
### asyncio.run(main())
