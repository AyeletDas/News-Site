import re  # for searching and replacing text patterns.
import feedparser  # for parsing RSS feed data.
import requests  # to make HTTP requests.
from bs4 import BeautifulSoup  # to parse HTML content.
import uuid  # to generate unique identifiers.
import time  # to work with time-related tasks.


class RSSFunction:  # class for handling RSS feed functions.
    DEFAULT_IMAGE_URL = "https://example.com/default-image.jpg"  # Sets a default image URL if none is found in the feed.
    CACHE = {}  # Creates a dictionary to store cached feed data.
    CACHE_EXPIRY_SECONDS = 300  # Sets cache expiry time to 300 seconds (5 minutes).

    @staticmethod # function inside a class. does not depend. אפשר לקרוא ישירות ל extract_image_from_description
    def extract_image_from_description(description):  # Defines a method to extract an image URL from the feed description.
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', description)  # find the first search. 
        # r' = חיפוש תו מיוחד. 
        # [^>]= אני מביאה את כל המאפיינים של התמונה עד למילה src (אם יש רוחב, גובה) 
        # מביאה את כל מה שבין הגרשיים (היחידות או הכפולות).  מביאה רק את הכתובת של התמונה.
        # description - שם החיפוש מתבצע
        if img_match:  # if found
            return img_match.group(1)  # Returns the URL of the found image.  תת הקבוצה הראשונה שהתאימה
        return None  # if not found

    @staticmethod # function inside a class. does not depend
    def clean_description(description): # to clean the description by removing unnecessary HTML tags.
        description = re.sub(r"<!\[CDATA\[.*?\]\]>", "", description)  # *Removes CDATA tags*. כל מה שנמצא ב <> לא יכלל 
        # re.sub= Replaced part of the string
        # CDATA (Character Data) - תווים שאנחנו לא רוצים שיכלול. הסימן קריאה זה התחלה של משהו מיוחד
        # .*? = תופס כל תו כולל רווחים (עד שימצא את התו הבא)
        description = re.sub(r"<.*?>", "", description)  # *Removes all HTML tags*.
        return description.strip()  # ניקוי רווחים
     
    @staticmethod # function inside a class. does not depend
    def extract_image_from_link(link):  # Defines a method to fetch an image from a link if it’s not in the description.
        try:
            response = requests.get(link)  # Sends a request to the link.
            if response.status_code == 200:  # Checks if the request was successful.
                soup = BeautifulSoup(response.content, 'html.parser')  # Parses the HTML content.
                img_tag = soup.find('img')  # Finds the first <img> tag.
                if img_tag and img_tag.get('src'):  # Checks if the image has a source URL.
                    return img_tag['src']  # Returns the image URL.
        except Exception as e:  # Handles any errors that occur during the request.
            print(f"Error fetching image from {link}: {e}")  # Prints the error message.
        return None  # Returns None if no image was found or if there was an error.

    @staticmethod # function inside a class. does not depend
    def parse_feed(urls):  # Defines a method to parse RSS feeds from a list of URLs.
        cache_key = tuple(urls)  # Converts the URLs list into a tuple to use as a cache key.
        current_time = time.time()  # Gets the current time.
        
        if cache_key in RSSFunction.CACHE:  # Checks if the data is already cached.
            cached_data, cache_timestamp = RSSFunction.CACHE[cache_key]  # Retrieves cached data and its timestamp.
            if current_time - cache_timestamp < RSSFunction.CACHE_EXPIRY_SECONDS:  # Checks if the cache has expired.
                print("Using cached data.")  # Prints a message indicating cached data is being used.
                return cached_data  # Returns the cached data if it’s still valid.

        articles = []  # Initializes an empty list to store parsed articles.
        for url in urls:  # Loops through each feed URL.
            feed = feedparser.parse(url)  # Parses the feed at the current URL.
            for entry in feed.entries:  # Loops through each entry in the feed.
                image_url = None  # Initializes the image URL as None.
                if hasattr(entry, "media_content"):  # Checks for an image in media_content.
                    image_url = entry.media_content[0].get("url")  # Retrieves the image URL.
                elif hasattr(entry, "media_thumbnail"):  # Checks for an image in media_thumbnail.
                    image_url = entry.media_thumbnail[0].get("url")  # Retrieves the image URL.
                elif hasattr(entry, "enclosures") and entry.enclosures:  # Checks for an image in enclosures.
                    image_url = entry.enclosures[0].get("href")  # Retrieves the image URL.
                elif hasattr(entry, "description"):  # If no image is found, check the description.
                    image_url = RSSFunction.extract_image_from_description(entry.description)  # Extracts an image from the description.

                if not image_url:  # If no image URL is found, try extracting from the article link.
                    image_url = RSSFunction.extract_image_from_link(entry.link)

                if not image_url or not re.match(r"^https?:", image_url):  # If image is invalid, use the default image.
                    image_url = RSSFunction.DEFAULT_IMAGE_URL

                clean_desc = RSSFunction.clean_description(entry.description)  # Cleans the description text.
                unique_id = str(uuid.uuid4())  # Generates a unique ID for each article.

                articles.append(  # Adds the article information to the articles list.
                    {
                        "id": unique_id,
                        "title": entry.title,
                        "link": entry.link,
                        "published": entry.published,
                        "published_parsed": entry.published_parsed,
                        "description": clean_desc,
                        "image": image_url,
                    }
                )

        articles.sort(key=lambda x: x["published_parsed"], reverse=True)  # Sorts articles by newest first.
        cached_data = articles[:10]  # Limits articles to the 10 most recent.
        RSSFunction.CACHE[cache_key] = (cached_data, current_time)  # Caches the result with a timestamp.
        return cached_data  # Returns the final parsed and sorted list of articles.

