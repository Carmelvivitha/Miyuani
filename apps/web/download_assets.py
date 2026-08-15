
import os
import requests

images_dir = "public/images"
os.makedirs(images_dir, exist_ok=True)

urls = {
    "marker-icon.png": "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    "marker-shadow.png": "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    "marker-icon-2x.png": "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
}

for name, url in urls.items():
    print(f"Downloading {name}...")
    try:
        response = requests.get(url)
        with open(os.path.join(images_dir, name), "wb") as f:
            f.write(response.content)
        print("Success.")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
