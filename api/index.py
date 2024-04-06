from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def get_election_results(city=None):
    base_url = "https://www.sabah.com.tr/secim/31-mart-2024-yerel-secim-sonuclari"

    if city:
        base_url = f"https://www.sabah.com.tr/secim/31-mart-2024-yerel-secim-sonuclari/{city}/ili-yerel-secim-sonuclari"

    try:
        response = requests.get(base_url, timeout=5)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return {"success": False, "response": "İstek yapılamadı."}

    html_content = response.content
    selector = BeautifulSoup(html_content, 'html.parser')

    genel_veriler = [
        {
            "index": index + 1,
            "toplamSecmen" if index == 0 else "acilanSandik" if index == 1 else "kullanilanOy" if index == 2 else "gecerliOy" if index == 3 else "gecersizOy" if index == 4 else "katilimOrani": element.find("span").get_text().strip()
        }
        for index, element in enumerate(selector.select("section.section-01.opened-box-section > div > div > div.row > div.col-12.col-md-8.col-lg-9 > div > ul li"))
    ]

    baskan_adaylari = [
        {
            "index": index + 1,
            "isimSoyisim": item.select_one("h5").get_text().strip(),
            "resim": item.select_one("img")["src"],
            "yuzdelik": item.select_one(".showcase-text span").get_text().strip(),
            "oy": item.select(".showcase-text span")[1].get_text().strip()
        }
        for index, item in enumerate(selector.select("div.showcase-item-wrapper div.showcase-item"))
    ] if city else None

    return {"success": True, "data": {"genelVeriler": genel_veriler, "baskanAdaylari": baskan_adaylari}}

@app.route('/election-results', methods=['GET'])
def election_results():
    city = request.args.get('city')
    result = get_election_results(city)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
