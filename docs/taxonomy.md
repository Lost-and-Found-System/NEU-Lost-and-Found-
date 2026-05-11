# Knowledge Taxonomy
## Overview
The knowledge taxonomy defines how item records are classified in NEU Found Hub. A well-designed taxonomy reduces retrieval effort by allowing users to filter by category rather than searching through all records. The taxonomy was designed using two principles:

- **Coverage:** Every type of item commonly lost on a university campus must fall into at least one category.
- **Distinctiveness:** Categories must be mutually exclusive enough that a user can confidently assign a single category to any item.

## The Six Categories
**1. Electronics**
- **Examples:** smartphones, laptops, chargers, earphones, calculators, USB drives, cameras
- **Rationale:** Electronics are the highest-value items lost on campus and the category most likely to be actively searched for. Separating electronics from other categories gives this high-priority group immediate visual prominence in filtered views.

**2. Clothing**
- **Examples:** school uniforms, jackets, hoodies, PE shirts
- **Rationale:** Clothing is the most frequently left-behind category in classrooms and canteens. Items are often low-value individually but high-volume collectively.

**3. ID/Cards**
- **Examples:** NEU school IDs, library cards, ATM cards, government IDs, stored value cards
- **Rationale:** Lost IDs cause significant academic disruption (cannot enter campus, cannot borrow library books, cannot take exams). This category is separated from Others specifically because of its high urgency and sensitivity — found IDs should be reported and claimed quickly.

**4. Keys**  
- **Examples:** dorm room keys, vehicle keys, padlocks, locker keys
- **Rationale:** Lost keys create immediate practical problems (locked out of dorm, cannot retrieve vehicle). Separating this category allows security staff and dormitory administrators to quickly filter for key-related posts.

**5. Accessories**
- **Examples:** bags, umbrellas, watches, eyeglasses, belts, earrings, necklaces, rings, bracelets
- **Rationale:**  Accessories are personal-use or carry items that complement daily student life. They are often distinctive in appearance (e.g., patterned bags, unique umbrellas, branded watches), making photo-based identification effective. Grouping them separately from Clothing ensures that wearable garments (uniforms, jackets) are not mixed with functional or decorative items.

**6. Others**
- **Examples:** books, notebooks, water bottles, food containers, sports equipment, musical instruments
- **Rationale:** A catch-all category for items that do not fit the five primary categories. The Others category prevents the taxonomy from becoming unwieldy while ensuring no item is left uncategorized.  

## Taxonomy Gap Identified
One limitation of this taxonomy is the absence of cross-category tagging. An item like a laptop bag could legitimately belong to both Electronics (it contains a laptop) and Accessory (it is a bag). Version 2.0 of the platform should implement a tags field in the Item schema to support multi-category classification.

## Taxonomy Quick Reference Table

| Category      | Common Items                        | Priority     | KM Note                                      |
|---------------|-------------------------------------|--------------|----------------------------------------------|
| Electronics   | Smartphones, laptops, chargers, earphones | HIGH         | Highest-value; fast action needed             |
| Clothing      | Uniforms, jackets, hoodies, PE shirts | HIGH         | High volume; most common leftover             |
| ID/Cards      | School IDs, ATM cards, library IDs  | MEDIUM-HIGH  | Causes academic disruption if lost            |
| Keys          | Dorm keys, vehicle keys, padlocks   | MEDIUM       | Immediate practical consequence               |
| Accessories   | Bags, umbrellas, watches, eyeglasses, belts | MEDIUM       | Personal-use/carry items; visually distinctive |
| Others        | Books, notebooks, bottles, sports equipment | MEDIUM       | Catch-all; prevents uncategorized items       |
