"""Build a copyright-safe candidate manifest from private cookbook extraction.

The committed manifest contains factual titles, hashes, and source locators only.
It intentionally excludes ingredients, quantities, instructions, prose, and media.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


PRIVATE_ROOT = Path("tmp/pdfs")
INVENTORY_PATH = PRIVATE_ROOT / "inventory.json"
PAGES_ROOT = PRIVATE_ROOT / "pages"
OUTPUT_PATH = Path("content/research/reference-cookbook-candidates.json")


def entries(block: str) -> list[tuple[int, str]]:
    parsed: list[tuple[int, str]] = []
    for raw_line in block.strip().splitlines():
        page_text, title = raw_line.split("|", maxsplit=1)
        parsed.append((int(page_text), title.strip()))
    return parsed


CURATED: dict[str, list[tuple[int, str]]] = {
    "black-butler-cookbook": entries(
        """
        5|Donburi
        7|Chocolate Curry Buns
        10|Three-Mushroom Risotto
        12|Pot-au-Feu
        14|Steak Pie
        16|Maultaschen
        18|Bratwurst Soup
        20|Lobster Cheese Soufflé
        24|Lemon Pie
        27|Apple Pie
        29|Orchard Pie
        31|Blackberry Cornmeal Cake
        33|Charlotte Cake
        37|Cabinet Pudding
        39|Christmas Pudding
        41|Gâteau au Chocolat
        44|Eton Mess
        46|Puits d’Amour
        49|La Forêt Noire
        52|Galette
        55|Golden Pudding
        57|Lemon Soufflé
        59|Summer Pudding
        61|Walnut Cake
        63|Rote Grütze
        65|Florentines
        """
    ),
    "dr-stone-unofficial-cookbook": entries(
        """
        8|Lillian’s Crepes
        9|Byakuya’s Ramen
        11|Child Senku’s Konpeito
        12|Yuzuriha’s Strawberry Macarons
        14|Taiju’s Foraged Charcuterie Board
        15|Senku’s Colour-Changing Poke Bowl
        17|Gen’s Floral Cola Cake
        18|Kaseki’s Raclette
        20|Chrome’s Rock Candy
        21|Ruri’s Hot Chocolate
        22|Kohaku’s Sweet and Sour Beef
        22|Suika’s Tanghulu and Mochi
        25|Chalk’s Dog Cookies
        26|Sagara’s Tonkatsu
        27|Kinro’s Bento Box
        28|Ginro’s Bento Box
        29|Magma’s Lava Cake
        30|Jasper’s Fish Tacos
        31|Turquoise’s Ceviche
        33|Namari’s Egg Tarts
        34|Soyuz’s Garlic Baked Potatoes
        35|Titan’s Lemon-Garlic Butter Fish
        37|Ukyo’s Onigiri
        39|Nikki’s Lemon and Sugar Crepes
        40|Yo’s Fried Chicken
        41|Homura’s Strawberry Pastries
        42|Hyoga’s Bao
        44|Tsukasa’s Brown Sugar Glazed Ham
        46|Mirai’s Birdie Bread
        47|Minami’s French Toast
        49|Ryusui’s Gazpacho
        50|Francois’s Gambas al Ajillo
        52|Amaryllis’s Sweet and Sour Fruit Salad
        53|Kirisame’s Paella de Mariscos
        55|Moz’s Nightmare Chicken
        56|Ibara’s Pineapple Poison Smoothie
        57|Matsukaze’s Matcha Mooncakes
        60|Luna’s Strawberry Shortcake
        62|Xeno’s Coffee Brownies
        64|Stanley’s Carne Mechada Burritos
        66|Chelsea’s Pumpkin Tiramisu
        67|Joel’s Red Wine Risotto
        68|Sai’s Kulfi
        69|Mecha Senku’s Cacao Powder
        72|Whyman’s Cookies
        """
    ),
    "mila-brady-studio-ghibli-cookbook": entries(
        """
        6|Breakfast à la Calcifer
        8|Sophie’s Bread and Cheese
        10|San’s Boiled Broccoli
        12|Umi’s Breakfast Mishmash
        14|Simple Egg Bread
        16|Lin’s Steamed Buns
        18|Spaghetti Bolognese
        20|Ashitaka’s Okayu
        22|Umi’s Tempura Batter
        24|Umi’s Fried Horse Mackerel
        26|Ponyo’s Ham Sandwiches
        28|Mei’s Grilled Corn
        30|Haku’s Rice Ball
        32|Seito’s Pickled Plums
        34|Soup Dumplings
        36|Marnie’s Lobster Tail
        38|Mei’s Bento Box
        40|Laputa’s Meatball Stew
        42|Nishi’s Nabeyaki Udon
        44|Garlic Herb Butter Roast Chicken
        46|Miso Ponyo’s Ramen
        48|Japanese Pork Roast
        50|Salmon in Béchamel Sauce
        52|Siberia Cake
        54|Simple Sponge Cake
        56|Kiki’s Chocolate Cake
        58|Kiki’s Broomstick Snacks
        60|Marnie’s Boatside Cookies
        62|Kiki’s Herring and Pumpkin Pie
        64|Setsuko’s Kohakutō Candy
        66|Kiki’s Soufflé Pancakes
        68|Kiki’s Birthday Cake Pie
        70|Banana Smoothie with Nuts and Seeds
        72|Ponyo’s Hot Honey Milk
        74|Ponyo’s Hot Chocolate
        """
    ),
    "avatar-official-cookbook": entries(
        """
        11|Mung Bean & Tofu Curry
        13|Chrysanthemum and Shiitake Dumplings
        15|Simple Steamed Vegetables
        17|Appa’s Apple Salad
        19|Aang’s Favorite Egg Tarts
        21|Sweet Rice
        23|Momo’s Moon Peaches
        25|Monk Gyatso’s Fruit Pies
        27|Guru Pathik’s Onion Banana Juice
        29|Air Temple Tsampa
        33|Sokka’s Salmon Jerky
        35|Fried Fish Balls on a Stick
        37|Gran Gran’s Smoked Arctic Hen Legs
        39|Foggy Swamp Chicken
        41|Blueberry Cookies
        43|Lightly Pickled Fish
        45|Stewed Sea Prune Soup
        47|Five-Flavor Soup
        49|Kale Cookies
        51|Yue’s Mooncakes
        53|Spirit Oasis Tea
        57|Aunt Wu’s Bean Curd Puffs
        59|Freedom Fighters Roast Pork Belly
        61|Gaoling Favorite Tea Eggs
        63|Beifong Beef
        65|Uncle Iroh’s Jook
        67|Song’s Roast Duck
        69|Seared Fish
        71|Cabbage Merchant’s Special Sour Cabbage Soup
        73|Charred Cabbage Noodles
        75|Cookie of the White Lotus
        77|Earthbender Mudslide
        79|Misty Palms Special Rice
        81|Lotus Root Salad
        83|Kyoshi Island Stuffed Apple Donuts
        85|Jennamite aka Creeping Crystal
        87|Avatar Day Unfried Dough
        89|Cabbage Cookies
        90|Cactus Juice
        91|Kale Smoothie
        93|Misty Palms Mango Smoothie
        97|Fresh Ginseng Tea
        98|Warming Ginger Tea
        99|Lychee Juice
        101|Jasmine Green Tea
        102|Jasmine Green Tea Kombucha
        103|Appa Blend Bubble Tea
        105|Tea Leaf Juice
        107|Bender Tea
        111|Flaming Fire Flakes
        113|Sizzle-Crisps
        115|Komodo Chicken
        117|Fresh Jiang Hui Clams
        119|Roku-Style Flaming Hot Chicken Skewers
        121|Fire Noodles
        123|The Firebending Masters
        125|Ember Island Cherry Ice Cream
        127|Fire Gummies
        96|Red-Blooded Nephew Tea
        108|Azula’s Lightning
        27|Balance Butter Tea
        97|Cucumber Aloe Juice
        """
    ),
    "lets-make-ramen": entries(
        """
        42|Chicken Stock and Fat
        43|Pork Stock and Fat
        45|Dashi
        46|Shio Broth and Shio Tare
        47|Shoyu Broth and Shoyu Tare
        48|Miso Broth and Miso Tare
        52|Tonkotsu Broth
        54|Torikotsu Broth
        57|Homemade Instant Ramen Cubes
        58|Homemade Instant Ramen Broth
        59|Fast Weeknight Ramen Broth
        60|Yasai Broth
        63|Gyokai Broth
        79|Handmade Ramen Noodles
        85|Baked Baking Soda (Kansui)
        89|Chashu
        92|Shredded Pork
        94|Pulled Chicken
        96|Yakitori
        98|Japanese Meatballs (Niku Dango and Tsukune)
        104|Ajitsuke Tamago
        108|Onsen Eggs
        110|Menma
        111|Pickled Shiitake Mushrooms
        114|Quick Crunchy Sauté
        115|Sauté and Steam
        116|Greens Sauté
        117|Crispy Chicken Skins
        118|Gari
        119|Charred Shallot and Scallion
        123|Aromatic Garlic and Shallot Oil
        124|Rayu
        125|Mayu
        132|Tsukemen
        134|Fortified Dashi
        134|Goma Miso Sauce
        135|Chashu Liquid for Tsukemen
        135|Spicy Tsukemen Broth
        138|Abura Soba
        141|Mazemen
        143|Creamy Mushroom Mazemen
        145|Hot and Cold Summer Tomato Mazemen
        148|Tantanmen
        150|Pork for Tantanmen
        151|Yakisoba
        154|Curry Ramen
        156|Kimchi-Braised Chicken Ramen
        159|Shrimp and Roasted Tomato Ramen
        163|Adobo Chicken Ramen
        168|Pressure Cooker Tonkotsu Broth
        169|Pressure Cooker Ajitsuke Tamago
        """
    ),
    "official-disney-parks-cookbook": entries(
        """
        15|Walt’s Chili and Beans
        16|Loaded Baked Potato Soup
        16|Pommes Frites with Cajun Remoulade
        17|Batuuan Ronto Wrap
        18|South Seas Island Delight
        18|Lemon Soda Float
        19|Rainbow Sprinkle Whoopie Pies
        20|Frozen Pineapple Treat Inspired by DOLE Whip
        21|Mickey Mouse Beignets
        22|Tres Leches Cake
        24|Holiday Ham Slider with Pineapple Cherry Jam
        25|Grilled Asparagus Caesar Salad
        26|Watermelon Lemonade
        26|Beet Kombucha Sangria
        27|Shrimp Boil Tacos with Andouille Sausage and Fresh Corn
        28|Monte Cristo
        29|White Hot Chocolate with Cinnamon Marshmallows
        31|White Chocolate Peppermint Bar
        32|Watsonville Strawberry Pie Tarts
        34|Charred Nebraska Corn Chowder
        35|Napa Rose Lavash
        35|Robusto Flatbread
        36|Blackberry Mojito
        36|Strawberry Basil Lemonade
        37|Blackberry Zinfandel Braised Short Ribs
        38|Goofy’s Kitchen Cherry Tomato and Bocconcini Salad
        39|Chocolate Martini
        40|McIntosh Apple Charlottes
        41|Scharffen Berger Chocolate Truffle Cake
        42|Strawberry Cheesecake
        44|Vegetable Potpie with Herbed Biscuit Topping
        45|Edamame Salad
        46|Grey Stuff
        47|Lemon Curd Cream Puffs
        50|Charred Skirt Steak, Corn Pancakes, and Jicama Slaw
        50|Marinated Skirt Steak
        51|Lamb Meatball with Spicy Tomato Chutney
        52|Grass-Fed Beef Sliders with Pimento Cheese
        53|Potato Pancakes with Chive Sour Cream
        54|Citrus Thistle
        54|Tzatziki Martini
        55|Frozen Dragon Berry Colada
        55|Glühwein (Hot Spiced Wine)
        56|Pork Goulash Pierogi
        56|Sauerkraut Pierogi
        57|New England Lobster Roll
        58|Coquito
        58|Florentine Cookies
        59|Pop Art Cookie
        60|Irish Whiskey Custard
        62|Totchos
        63|Dagobah Slug Slinger
        64|The Hollywood Brown Derby Cobb Salad
        65|Space Monkey
        66|Key Lime Pie
        67|Amaretto Flan with White Chocolate Whip
        69|Asian Noodle Salad
        70|Savanna Spring Rolls
        71|Tomato Florentine Soup
        71|Watermelon Rind Salad
        72|Naan Bread with Cucumber Raita
        73|Lamb Kefta with Tamarind Sauce
        75|Sugarcane Mojito
        76|Spicy Durban-Style Chicken
        77|Peri Peri Salmon
        78|Chickpea Salad
        79|Flame Tree Barbecue Sauce
        80|Mango Lassi
        81|African Fruit Fool
        82|Chai Cream
        83|Stone Fruit Samosas
        85|Honey-Coriander Chicken Wings
        86|Kona Salad
        86|Classic Scones
        87|Smoked-Salmon-and-Herb Muffins
        88|Big Apple Sunset
        88|Watermelon Mist
        88|Pink Leilani
        89|Hoopla
        90|Chardonnay-Steamed Penn Cove Mussels with Pesto Cream Sauce
        91|Grouper with Asian Vegetables, Sticky Rice, and Ginger-Soy Broth
        92|Chef Mickey’s Breakfast Pizza
        93|Grilled Pork Tenderloin
        95|S’mores Gelato Shake
        96|Chocolate Gingerbread Soufflé with Chocolate Cream Sauce
        97|No-Bake Granola Treats
        97|Oatmeal Raisin Cookies
        98|Honey Crunch Cake
        98|Sponge Cake
        101|BLT Flatbread
        102|Tuna Poke with Avocado Mousse
        103|POG Breakfast Juice
        104|Castaway Wave
        104|Blue Hawaiian
        104|“Colette” Champagne Cocktail
        105|Paddy Mint Mocha
        105|Konk Kooler
        106|Coconut Cream French Macarons
        107|Caramel Hawaiian Sweet Bread Pudding
        108|Orange Almond Cake with Lemon Cream
        80|Frunch
        """
    ),
    "stardew-valley-cookbook": entries(
        """
        8|Algae Soup
        10|Artichoke Dip
        12|Autumn’s Bounty
        14|Baked Fish
        16|Bean Hotpot
        18|Blackberry Cobbler
        20|Blueberry Tart
        22|Bread
        24|Bruschetta
        26|Carp Surprise
        28|Cheese Cauliflower
        30|Chocolate Cake
        32|Chowder
        34|Coleslaw
        36|Complete Breakfast
        38|Cookies
        40|Crab Cakes
        42|Cranberry Candy
        44|Cranberry Sauce
        46|Crispy Bass
        48|Dish o’ the Sea
        50|Eggplant Parmesan
        52|Escargot
        54|Farmer’s Lunch
        55|Fiddlehead Risotto
        57|Fish Stew
        59|Fish Tacos
        51|Fried Calamari
        63|Fried Eel
        65|Fried Egg
        67|Fried Mushroom
        69|Fruit Salad
        70|Glazed Yams
        72|Hashbrowns
        74|Ice Cream
        76|Lobster Bisque
        78|Maki Roll
        81|Maple Bar
        84|Miner’s Treat
        87|Omelet
        88|Pale Broth
        90|Pancakes
        92|Parsnip Soup
        94|Pepper Poppers
        96|Plum Pudding
        99|Pink Cake
        102|Pizza
        104|Poppyseed Muffin
        106|Pumpkin Pie
        108|Pumpkin Soup
        111|Radish Salad
        112|Red Plate
        114|Rhubarb Pie
        116|Rice Pudding
        118|Roasted Hazelnuts
        120|Roots Platter
        122|Salad
        124|Salmon Dinner
        126|Spaghetti
        128|Spicy Eel
        130|Stir Fry
        132|Stuffing
        134|Strange Bun
        136|Super Meal
        138|Survival Burger
        140|Tom Kha Soup
        142|Tortilla
        144|Trout Soup
        146|Vegetable Medley/Platter
        148|Bran Muffins
        149|Coco-No-No
        151|Evelyn’s Seasonal Cookies: Spring
        153|Evelyn’s Seasonal Cookies: Summer
        155|Evelyn’s Seasonal Cookies: Autumn
        157|Evelyn’s Seasonal Cookies: Winter
        159|Field Snack
        160|Grilled Steak and Linguine with Mushroom Cream Sauce
        163|Hot Cider
        165|Kale and Walnut Salad
        167|Lentil Soup
        169|Luau Soup
        171|Lucky Lunch
        174|Pumpkin Ale
        176|Stardrop
        178|Salted Radish Sandwiches
        180|Vanilla Ice Cream and Blue Raspberry Sauce
        182|Yellow Curry
        184|Zucchini Fritters and Spicy Marinara Sauce
        186|Cheese
        190|Coffee
        192|Jelly
        195|Mead
        198|Wine
        """
    ),
    "studio-ghibli-recipe-book": entries(
        """
        10|Ponyo Ramen Noodles
        12|Steamed Red Buns
        14|Sponge Cake
        16|Herring Pot Pie
        18|Bento Boxes
        20|Rice Porridge
        22|Ba-Wan (Giant Soup Dumplings)
        24|Fried Horse Mackerel
        26|Salmon in Béchamel Sauce
        """
    ),
    "one-piece-pirate-recipes": entries(
        """
        8|Fried Rice for Gin
        9|Really Really Bad (Good) Staff Soup
        10|Pirate Box Lunches for Crossing the Desert
        12|Treasure-Splitting Sandwiches
        16|Water Seven’s Water-Water Meat BBQ
        16|Monstrous Grilled Giant Sandora Dragon
        18|Luffy’s Favorite, Meat on the Bone
        20|Yagara Bull’s Favorite, Steamed Water-Water Meat
        22|Impel Down’s Roast Hummingbird
        24|Lakeside Campsite Hot Rock Stew
        26|Absalom’s Croquettes
        28|Davy Back Fight Frankfurters
        32|Sky Seafood Extravaganza
        34|The Trunk Is Good: Elephant True Bluefin Sauté
        36|Fresh from the White Sea, Sky Fish Sauté
        38|Monkey Mountain Allied Force’s Full-Course Mackerel Pike
        40|Roasted Sky Shark from Sky Island
        42|The Mermaid Café’s Kelp Brûlée
        44|Camie’s Delicious Clams
        44|Perfect Finger Food! Sliced Octopus
        48|Skypiea Lunch for a Gold Hunt
        50|Water Seven’s Water-Water Cabbage
        52|Island of Women’s Laughing Mushrooms
        52|Yosaku’s Favorite, Stir-Fried Bean Sprouts
        54|Early Summer Pommes Paille
        56|Former-Pirate Shakky’s Simmered Beans
        60|Team Straw Hat Is in Trouble! Monster Burger
        62|Tom’s Workers, Kokoro’s Curry Rice
        64|Davy Back Fight, Food Cart Yakisoba
        68|Davy Back Fight, Free Inari Sushi
        69|Davy Back Fight, Free Kitsune Udon
        70|Neptunian Penne Gorgonzola
        72|For Ladies Only! Special Octopus Fritters
        76|Mock Town Cherry Pie
        78|Cindy’s Flan
        80|Ganfor’s Pumpkin Juice
        80|Luffy and Zolo Love Bread Crusts
        82|Test Your Luck with Exploding Apples
        84|On the House, Fruit Macédoine
        86|Antonio’s Graman (Grand Line Manju Buns)
        88|Sanji’s Eye 1: Oda Sensei’s Favorite, Sea Chicken Onigiri
        90|Sanji’s Eye 2: One Piece Workplace Party Paparazzi
        92|Sanji’s Eye 3: Home Cooking at the Oda House Paparazzi
        94|Sanji’s Eye 4: A First-Class Cook’s Basic Broth
        """
    ),
    "food-wars-recipe-compilation": entries(
        """
        1|Jellied Meat Broth and Scrambled Eggs Furikake Gohan
        2|Apple Risotto
        3|Soma’s Soufflé Omelet
        4|The Queen’s Eggs Benedict
        5|Alice’s Milkshake
        6|Insalata Frittata, Aldini Style
        7|Sumire Original Fried-Chicken Wrap
        8|Spicy Roast Chicken with Salsa Verde
        9|Apicius-Style Chicken
        9|Kabayaki Eel (Joke) Matelote
        9|Thick ’n’ Creamy Mashed Potatoes
        10|Yukihira Style Okaki-no-Tane-Age with Creamy Ki No Me Sauce
        11|Yukihira Style Canned Mackerel Burger
        12|Yukihira Style Spanish Mackerel Onigiri Chazuke
        13|Yukihira Style Shalyapin Steak Don
        14|Pepper-Grilled Seer Fish with Spring Cabbage Purée
        15|Joichiro Special Breakfast Kotteri Ramen
        16|Soma’s Curry Risotto Omelet
        17|Nikumi’s Dongpo-Pork-Curry Bowl
        18|Marui’s Potage-Blanc-Curry Udon
        19|Megumi’s Monkfish-Dobujiru Curry
        20|Kozuyu Chicken Soy Sauce Ramen
        20|Pickled-Plum Chicken
        21|Italian Tomato Somen
        22|Chef Shinomiya’s Burdock Quiche
        23|Chou Farci
        24|Yukihira-Style Advanced Seaweed Bento
        24|Beer-Battered Isobe-Fried Chikuwa and Deep-Fried Cod
        24|Pickled-Shallot Tartar Sauce
        24|Savory Seaweed Paste
        24|Tsukudani Made from Soup-Stock Remnants
        24|Balsamic Kinpira Burdock Root
        24|Bacon and Onion Miso Soup
        24|Kuzu Sauce
        25|Alice’s Temari Bento
        26|Mimasaka’s Semifreddo
        26|Caramel Almonds
        26|Semifreddo Cream
        26|Biscuit Joconde
        26|Olive Oil Lemon Curd
        27|Mitamura’s Western Cuisine Special! Old-Fashioned Napolitan
        28|Pike Carpaccio
        29|Cartoccio
        30|Pike Takikomi Rice, Ojiya-Style
        31|Kozhi Varutha Curry
        32|Rainbow Terrine
        32|Carrot Terrine Layer
        32|Spinach Terrine Layer
        32|Potato Terrine Layer
        32|Tomato Terrine Layer
        33|Homemade Ponzu Gelée
        33|Green Herb Sauce
        33|Zucchini Terrine Layer
        33|Pumpkin Terrine Layer
        33|Mushroom Terrine Layer
        34|Colorful-Surprise Pot Stickers
        35|A Restaurant Kuga Special! Mapo Tofu
        36|Kurokiba’s Coulibiac-Style Salmon Pot Pie
        36|Spinach Crêpe
        37|Egg-Tempura Rice Bowl
        """
    ),
}


def load_pages(key: str) -> dict[int, str]:
    rows: dict[int, str] = {}
    with (PAGES_ROOT / f"{key}.jsonl").open(encoding="utf-8") as stream:
        for line in stream:
            row = json.loads(line)
            rows[int(row["page"])] = str(row["text"])
    return rows


def from_outline(inventory: dict[str, Any], key: str) -> list[tuple[int, str]]:
    outline = inventory[key]["outline"]
    if key == "bake-anime":
        excluded = {"Japanese Desserts", "Non-Japanese Desserts", "Anime-Inspired Desserts"}
        return [
            (int(item["page"]), str(item["title"]))
            for item in outline
            if item["page"] and 26 <= int(item["page"]) <= 401 and item["title"] not in excluded
        ]
    if key == "anime-chef-cookbook":
        excluded = {"APPETIZERS", "MAINS", "DESSERTS", "DRINKS"}
        return [
            (int(item["page"]), str(item["title"]).split(":", maxsplit=1)[0].title())
            for item in outline
            if item["page"]
            and 14 <= int(item["page"]) <= 202
            and item["title"] not in excluded
            and ":" in str(item["title"])
        ]
    if key == "naruto-anime-recipes":
        return [
            (
                int(item["page"]),
                re.sub(r"^\d+\.\s*", "", str(item["title"])).strip(),
            )
            for item in outline
            if item["page"] and 8 <= int(item["page"]) <= 66
        ]
    raise KeyError(key)


def dr_stone() -> list[tuple[int, str]]:
    text = load_pages("dr-stone-unofficial-cookbook")[4]
    parsed: list[tuple[int, str]] = []
    for line in text.splitlines():
        match = re.match(r"(.+?)\s+p\.(\d+)(?:\s*-\s*(?:p\.)?\d+)?$", line.strip(), re.I)
        if match:
            parsed.append((int(match.group(2)), match.group(1).strip()))
    return parsed


def unofficial_ghibli() -> list[tuple[int, str]]:
    parsed: list[tuple[int, str]] = []
    chapter_pattern = re.compile(r"Chapter\s+(\d+)\s*:\s*(.+)", re.I)
    for page_number in range(6, 10):
        text = load_pages("unofficial-studio-ghibli-cookbook")[page_number]
        text = re.sub(r"\n(?=[A-Z][a-z])", " ", text)
        for line in text.splitlines():
            match = chapter_pattern.search(line.strip())
            if match and int(match.group(1)) >= 3:
                parsed.append((page_number, match.group(2).strip()))
    return parsed


def stardew() -> list[tuple[int, str]]:
    parsed: list[tuple[int, str]] = []
    buffer: list[str] = []
    ignored = {"Index", "Bonus Recipes:", "Artisan Goods:"}
    for source_page in range(5, 8):
        for raw_line in load_pages("stardew-valley-cookbook")[source_page].splitlines():
            line = re.sub(r"\s+", " ", raw_line).strip()
            if not line or line in ignored or re.fullmatch(r"\d+", line):
                continue
            page_match = re.fullmatch(r"Page\s+(\d+)", line, re.I)
            if not page_match:
                buffer.append(line)
                continue
            title = " ".join(buffer).strip()
            buffer = []
            if title in {"Spring", "Summer", "Autumn", "Winter"}:
                title = f"Evelyn’s Seasonal Cookies: {title}"
            replacements = {
                "Poppyseed Mun": "Poppyseed Muffin",
                "Stung": "Stuffing",
                "Bran Muns": "Bran Muffins",
                "Coee": "Coffee",
            }
            title = replacements.get(title, title)
            parsed.append((int(page_match.group(1)) + 1, title))
    return parsed


def ffxv() -> list[tuple[int, str]]:
    parsed: list[tuple[int, str]] = []
    for source_page in (3, 4):
        for line in load_pages("ffxv-community-cookbook")[source_page].splitlines():
            match = re.match(r"(.+?)\s*\.{5,}\s*(\d+)\s*$", line.strip())
            if not match:
                continue
            title = re.sub(r",\s*(?:by\s+)?[^,]+$", "", match.group(1), flags=re.I).strip()
            parsed.append((int(match.group(2)), title.title()))
    return parsed


def normalize_title(title: str) -> str:
    title = unicodedata.normalize("NFKD", title)
    title = "".join(character for character in title if not unicodedata.combining(character))
    title = title.replace("’", "'").replace("&", " and ")
    title = re.sub(r"[^a-zA-Z0-9]+", " ", title).strip().lower()
    return re.sub(r"\s+", " ", title)


def extraction_method(key: str) -> str:
    if key in {"studio-ghibli-recipe-book", "one-piece-pirate-recipes", "food-wars-recipe-compilation"}:
        return "visual_toc_or_heading_review"
    if key in CURATED:
        return "curated_heading_or_index_review"
    if key in {"bake-anime", "anime-chef-cookbook", "naruto-anime-recipes"}:
        return "pdf_outline"
    return "text_toc_or_index"


def dynamic_candidates(inventory: dict[str, Any]) -> dict[str, list[tuple[int, str]]]:
    return {
        "bake-anime": from_outline(inventory, "bake-anime"),
        "unofficial-studio-ghibli-cookbook": unofficial_ghibli(),
        "anime-chef-cookbook": from_outline(inventory, "anime-chef-cookbook"),
        "naruto-anime-recipes": from_outline(inventory, "naruto-anime-recipes"),
        "ffxv-community-cookbook": ffxv(),
    }


def validate(source_rows: Iterable[dict[str, Any]], occurrences: list[dict[str, Any]]) -> None:
    source_keys = {row["key"] for row in source_rows}
    occurrence_sources = {row["sourceKey"] for row in occurrences}
    if source_keys != occurrence_sources:
        missing = source_keys - occurrence_sources
        raise ValueError(f"Sources without recipe candidates: {sorted(missing)}")
    if len(occurrences) < 700:
        raise ValueError(f"Expected an extensive manifest; found only {len(occurrences)} candidates")
    duplicate_locators = Counter(
        (row["sourceKey"], row["sourcePage"], row["normalizedTitle"])
        for row in occurrences
    )
    duplicates = [key for key, count in duplicate_locators.items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate source locators: {duplicates[:5]}")


def main() -> None:
    inventory_rows = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    inventory = {row["key"]: row for row in inventory_rows}
    candidates = {**CURATED, **dynamic_candidates(inventory)}
    occurrences: list[dict[str, Any]] = []

    for source_key, source_candidates in candidates.items():
        source = inventory[source_key]
        for position, (source_page, title) in enumerate(source_candidates, start=1):
            normalized = normalize_title(title)
            occurrences.append(
                {
                    "id": f"{source_key}:{position:03d}",
                    "sourceKey": source_key,
                    "title": title,
                    "normalizedTitle": normalized,
                    "canonicalKey": normalized.replace(" ", "-"),
                    "sourcePage": source_page,
                    "sourceLocator": f"PDF page {source_page}",
                    "primaryKind": source["primaryKind"],
                    "franchiseHint": source["franchiseHint"],
                    "candidateKind": "recipe_or_named_component",
                    "extractionMethod": extraction_method(source_key),
                    "rightsStatus": "research_only",
                    "editorialState": "candidate",
                }
            )

    occurrences.sort(key=lambda row: (row["sourceKey"], row["sourcePage"], row["id"]))
    validate(inventory_rows, occurrences)
    counts = Counter(row["sourceKey"] for row in occurrences)
    unique_titles = len({row["normalizedTitle"] for row in occurrences})
    manifest = {
        "schemaVersion": 1,
        "policy": {
            "scope": "research_discovery_only",
            "allowedFields": ["factual title", "source hash", "source locator"],
            "excludedFields": [
                "ingredients",
                "quantities",
                "instructions",
                "expressive prose",
                "source media",
            ],
            "publicationRequiresIndependentEditorialPipeline": True,
        },
        "summary": {
            "sourceCount": len(inventory_rows),
            "occurrenceCount": len(occurrences),
            "uniqueNormalizedTitleCount": unique_titles,
            "occurrencesBySource": dict(sorted(counts.items())),
        },
        "sources": [
            {
                "key": row["key"],
                "title": row["title"],
                "fileName": row["file"],
                "sha256": row["originalSha256"],
                "pageCount": row["pageCount"],
                "primaryKind": row["primaryKind"],
                "franchiseHint": row["franchiseHint"],
                "rightsStatus": "research_only",
            }
            for row in inventory_rows
        ],
        "occurrences": occurrences,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {len(occurrences)} source occurrences, "
        f"{unique_titles} unique normalized titles to {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
