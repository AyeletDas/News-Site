from flask import Blueprint, request, jsonify
from rss.functions_rss import RSSFunction
from rss.links_rss import RSS_FEEDS  # links

rss = Blueprint("rss", __name__)


# Route לקבלת מאמרים ב-GET לפי קטגוריה  http://localhost:5000/articles?category=fashion&limit=5
@rss.route("/", methods=["GET"])
def get_articles():
    category = request.args.get("category")  # קבלת קטגוריה מהפרמטרים
    limit = request.args.get("limit", default=10, type=int)  # קבלת פרמטר limit
    if category in RSS_FEEDS:
        urls = RSS_FEEDS[category]
        articles = RSSFunction.parse_feed(urls)[:limit]  # הגבלת מספר מאמרים
        # יצירת מילון שבו הלינק הוא המפתח
        articles_dict = {article["link"]: article for article in articles}
        return jsonify(articles_dict), 200  # החזרת JSON של המאמרים
    else:
        return (
            jsonify({"error": "Category not found"}),
            404,
        )  # שגיאה אם הקטגוריה לא קיימת
