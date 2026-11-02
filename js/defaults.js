// ডিফল্ট কন্টেন্ট — অ্যাডমিন প্যানেল থেকে সবকিছু বদলানো যায়। ডেটাবেস খালি থাকলে এগুলো দেখানো হয়।
const L = (bn, en) => ({ bn, en });
const HF = (a, b) => [{ label: L('হাফ', 'Half'), price: a }, { label: L('ফুল', 'Full'), price: b }];
const ONE = p => [{ label: null, price: p }];

export const DEFAULT_SETTINGS = {
  brand: { name: L('রেড কার্পেট', 'Red Carpet'), tagline: L('ডিভাইন ডেস্টিনেশন', 'Divine Destination') },
  accent: '#b3171c',
  contact: {
    phone: '01405224569', whatsapp: '8801405224569', email: '', facebook: '', map: '',
    address: L('বানিয়াজুরি, ঘিওর, মানিকগঞ্জ, বাংলাদেশ', 'Baniajuri, Ghior, Manikganj, Bangladesh'),
    hours: L('প্রতিদিন সকাল ১০:০০ – রাত ১১:০০', 'Every day, 10:00 AM – 11:00 PM')
  },
  hero: {
    badge: L('বানিয়াজুরি, ঘিওর, মানিকগঞ্জ', 'Baniajuri, Ghior, Manikganj'),
    title: L('আপনার বিশেষ মুহূর্ত, আমাদের অগ্রাধিকার', 'Your special moments, our priority'),
    subtitle: L('বিয়ে, কনভেনশন, কর্পোরেট অনুষ্ঠান, পার্টি আর পারিবারিক আড্ডা — সুন্দর আয়োজন আর সুস্বাদু খাবারে আপনার দিনটিকে স্মরণীয় করে তুলতে রেড কার্পেটে স্বাগতম।',
      'Weddings, conventions, corporate events, parties and family gatherings — welcome to Red Carpet, where good food and a beautiful setting make the day memorable.'),
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
  },
  about: {
    title: L('মানিকগঞ্জের ডিভাইন ডেস্টিনেশন', 'A divine destination in Manikganj'),
    intro: L('ঘিওরের বানিয়াজুরিতে অবস্থিত রেড কার্পেট — উঁচু মানের উদযাপন, কনভেনশন, কর্পোরেট ইভেন্ট আর ফাইন-ডাইনিংয়ের জন্য আপনার ঠিকানা।',
      'Located in Baniajuri, Ghior, Red Carpet is your address for high-end celebrations, conventions, corporate events and fine dining.'),
    cards: [
      { title: L('আমাদের লক্ষ্য', 'Our vision'), text: L('মানিকগঞ্জজুড়ে বিশ্বমানের আতিথেয়তা, সুন্দর ইভেন্ট স্পেস আর সেরা খাবার পৌঁছে দেওয়া।', 'To bring world-class hospitality, beautiful event spaces and excellent food to Manikganj.') },
      { title: L('আমাদের পরিবেশ', 'Our ambience'), text: L('প্রশস্ত কনভেনশন হল, ফাইন-ডাইনিং রেস্টুরেন্ট আর সাজানো-গোছানো চারপাশ নিয়ে রুচিশীল পরিবেশ।', 'Spacious convention halls, a fine-dining restaurant and well-kept surroundings, designed with taste.') },
      { title: L('আমাদের অঙ্গীকার', 'Our promise'), text: L('আপনার বিশেষ মুহূর্তই আমাদের সর্বোচ্চ অগ্রাধিকার — পেশাদার আয়োজন, স্মরণীয় অভিজ্ঞতা।', 'Your special moments come first — professional service and an experience you will remember.') }
    ]
  },
  announcement: { enabled: false, text: L('', '') },
  ordering: { open: true, tables: 20, takeaway: true, closedMsg: L('এই মুহূর্তে অনলাইন অর্ডার বন্ধ আছে। অনুগ্রহ করে কাউন্টারে যোগাযোগ করুন।', 'Online ordering is paused right now. Please order at the counter.') },
  services: [
    { icon: 'fa-ring', title: L('ডেস্টিনেশন ওয়েডিং', 'Destination Wedding'), text: L('আপনার জীবনের সবচেয়ে গুরুত্বপূর্ণ দিনটিকে জাঁকজমকপূর্ণ ও রোমান্টিক করে তুলতে সেরা আয়োজন।', 'The best arrangements to make the most important day of your life grand and romantic.') },
    { icon: 'fa-building-columns', title: L('কনভেনশন সেন্টার', 'Convention Centre'), text: L('বড় আকারের সামাজিক ও সাংস্কৃতিক অনুষ্ঠানের জন্য প্রশস্ত ও আধুনিক সুবিধাসম্পন্ন হল।', 'A spacious, modern hall for large social and cultural events.') },
    { icon: 'fa-briefcase', title: L('কর্পোরেট কনফারেন্স', 'Corporate Conference'), text: L('মিটিং, সেমিনার ও কর্পোরেট ইভেন্টের জন্য পেশাদার পরিবেশ ও প্রয়োজনীয় সব সুবিধা।', 'A professional setting with the facilities you need for meetings, seminars and corporate events.') },
    { icon: 'fa-champagne-glasses', title: L('পার্টি হল', 'Party Hall'), text: L('জন্মদিন, বিবাহবার্ষিকী ও ফ্যামিলি গেট-টুগেদারের জন্য আনন্দময় জায়গা।', 'A fun space for birthdays, anniversaries and family get-togethers.') },
    { icon: 'fa-utensils', title: L('রেস্টুরেন্ট ও বুফে', 'Restaurant & Buffet'), text: L('থাই, চাইনিজ, ইন্ডিয়ান ও ফাস্টফুডের সমাহারে মনোরম ডাইনিং অভিজ্ঞতা।', 'Thai, Chinese, Indian and fast food in a pleasant dining setting.') },
    { icon: 'fa-users', title: L('ফ্যামিলি গেট-টুগেদার', 'Family Get-Together'), text: L('পরিবারের সবাইকে নিয়ে আরামদায়ক পরিবেশে সুন্দর সময় কাটানোর আদর্শ জায়গা।', 'A comfortable place to spend quality time with the whole family.') }
  ]
};

export const DEFAULT_CATEGORIES = [
  { id: 'appetizers', icon: 'fa-utensils', name: L('অ্যাপিটাইজার', 'Appetizers') },
  { id: 'soups', icon: 'fa-mug-hot', name: L('স্যুপ', 'Soups') },
  { id: 'main-dishes', icon: 'fa-plate-wheat', name: L('মেইন ডিশ', 'Main Dishes') },
  { id: 'seafood', icon: 'fa-fish', name: L('সি-ফুড ও প্রন', 'Seafood & Prawn') },
  { id: 'beef', icon: 'fa-bowl-food', name: L('বিফ আইটেম', 'Beef Dishes') },
  { id: 'chicken', icon: 'fa-drumstick-bite', name: L('চিকেন আইটেম', 'Chicken Dishes') },
  { id: 'rice-noodles', icon: 'fa-bowl-rice', name: L('রাইস ও নুডলস', 'Rice & Noodles') },
  { id: 'vegetables', icon: 'fa-carrot', name: L('সবজি ও সিজলিং', 'Vegetables & Sizzling') },
  { id: 'set-meals', icon: 'fa-box-open', name: L('সেট মিল', 'Set Meals') },
  { id: 'fast-food', icon: 'fa-pizza-slice', name: L('পিৎজা, বার্গার ও ফাস্টফুড', 'Pizza, Burgers & Fast Food') },
  { id: 'khichuri', icon: 'fa-bowl-rice', name: L('খিচুড়ি', 'Khichuri') }
].map((c, i) => ({ ...c, order: i }));

// [cat, nameEn, nameBn, descEn, descBn, variants, featured?]
const M = [
  ['appetizers', 'Special Mixed Seafood Salad', 'স্পেশাল মিক্সড সি-ফুড সালাদ', 'Fresh mixed seafood with house special dressing.', 'বিশেষ ড্রেসিংয়ে তাজা মিক্সড সি-ফুড।', ONE(595)],
  ['appetizers', 'Special Grilled Beef / Chicken Salad', 'স্পেশাল গ্রিলড বিফ / চিকেন সালাদ', 'Grilled beef or chicken tossed with garden greens.', 'গ্রিল করা বিফ বা চিকেন, সাথে তাজা সবুজ সালাদ।', ONE(675)],
  ['appetizers', 'Red Carpet Special Mixed Starters', 'রেড কার্পেট স্পেশাল মিক্সড স্টার্টার', 'Fish finger, spring roll, fried wonton (9 pcs).', 'ফিশ ফিঙ্গার, স্প্রিং রোল, ফ্রাইড ওয়ানটন (৯ পিস)।', ONE(480), 1],
  ['appetizers', 'Fried Spring Roll / Fried Wonton (8 pcs)', 'ফ্রাইড স্প্রিং রোল / ওয়ানটন (৮ পিস)', 'Crispy rolls or wontons.', 'মচমচে স্প্রিং রোল বা ওয়ানটন।', HF(180, 350)],
  ['appetizers', 'Thai Chicken Satay with Peanut Butter Sauce', 'থাই চিকেন সাতে (পিনাট বাটার সস)', '6 pcs tender chicken satay with rich peanut sauce.', '৬ পিস নরম চিকেন সাতে, সাথে ঘন পিনাট সস।', ONE(550)],
  ['appetizers', 'Szechuan Crispy Chicken Salad with Cashew Nut', 'সেজুয়ান ক্রিস্পি চিকেন সালাদ (কাজুবাদাম)', 'Crispy chicken and cashews in spicy Szechuan dressing.', 'ঝাল সেজুয়ান ড্রেসিংয়ে মচমচে চিকেন ও কাজুবাদাম।', ONE(495)],
  ['appetizers', 'Special Fried Wonton (8 pcs)', 'স্পেশাল ফ্রাইড ওয়ানটন (৮ পিস)', 'Golden crispy wontons.', 'সোনালি মচমচে ওয়ানটন।', HF(220, 440)],
  ['appetizers', 'Fried Prawn Ball Platter (8 pcs)', 'ফ্রাইড প্রন বল প্ল্যাটার (৮ পিস)', 'Crunchy prawn balls.', 'মচমচে চিংড়ির বল।', HF(270, 525)],
  ['appetizers', 'Prawn / Chicken on Toast (8 pcs)', 'প্রন / চিকেন অন টোস্ট (৮ পিস)', 'Crispy toast topped with seasoned prawn or chicken.', 'মসলা মাখানো চিংড়ি বা চিকেন দেওয়া মচমচে টোস্ট।', HF(230, 450)],
  ['appetizers', 'Fried Fish Finger with Chips (8 pcs)', 'ফ্রাইড ফিশ ফিঙ্গার উইথ চিপস (৮ পিস)', 'Golden fish fingers with potato chips.', 'সোনালি ফিশ ফিঙ্গার, সাথে আলুর চিপস।', HF(230, 450)],

  ['soups', 'Red Carpet Special Soup (Full)', 'রেড কার্পেট স্পেশাল স্যুপ (ফুল)', "Chef's signature hearty soup.", 'শেফের নিজস্ব রেসিপির ভরপুর স্যুপ।', ONE(899), 1],
  ['soups', 'Cream of Mushroom', 'ক্রিম অব মাশরুম', 'Rich, velvety mushroom soup.', 'ঘন ও মোলায়েম মাশরুম স্যুপ।', ONE(550)],
  ['soups', 'Tom Yam Soup (Spicy / Clear)', 'তম ইয়াম স্যুপ (স্পাইসি / ক্লিয়ার)', 'Traditional Thai hot & sour soup.', 'ঐতিহ্যবাহী থাই ঝাল-টক স্যুপ।', ONE(599), 1],
  ['soups', 'Thai Special Mixed Seafood Soup (Full)', 'থাই স্পেশাল মিক্সড সি-ফুড স্যুপ (ফুল)', 'Prawns, fish and squid.', 'চিংড়ি, মাছ ও স্কুইডে ভরা।', ONE(650)],
  ['soups', 'Thai Steamed Chicken Soup (Full)', 'থাই স্টিমড চিকেন স্যুপ (ফুল)', 'Light, soothing steamed chicken soup.', 'হালকা ও আরামদায়ক স্টিমড চিকেন স্যুপ।', ONE(530)],
  ['soups', 'Special Corn Soup with Mushroom & Cashew Nuts', 'স্পেশাল কর্ন স্যুপ (মাশরুম ও কাজুবাদাম)', 'Sweet corn soup with mushrooms and cashews.', 'মিষ্টি ভুট্টার স্যুপ, সাথে মাশরুম ও কাজুবাদাম।', ONE(540)],
  ['soups', 'Chicken Corn Soup / Chicken Vegetable Soup', 'চিকেন কর্ন স্যুপ / চিকেন ভেজিটেবল স্যুপ', 'A hearty bowl.', 'ভরপুর এক বাটি স্যুপ।', HF(290, 440)],
  ['soups', 'Sichuan Soup / Hot & Sour Soup (Full)', 'সিচুয়ান স্যুপ / হট অ্যান্ড সাওয়ার স্যুপ (ফুল)', 'Spicy, tangy Sichuan-style soup.', 'ঝাল-টক সিচুয়ান স্টাইলের স্যুপ।', ONE(540)],
  ['soups', 'Thai Soup with Chicken & Prawn (Thick)', 'থাই স্যুপ (চিকেন ও প্রন, ঘন)', 'Classic thick Thai soup.', 'ক্লাসিক ঘন থাই স্যুপ।', HF(300, 480)],
  ['soups', 'Chicken Noodle / Wonton Soup', 'চিকেন নুডল / ওয়ানটন স্যুপ', 'Noodles or wontons in savory broth.', 'সুস্বাদু ঝোলে নুডলস বা ওয়ানটন।', ONE(540)],

  ['main-dishes', 'Special Grilled Red Snapper (Medium)', 'স্পেশাল গ্রিলড রেড স্ন্যাপার (মাঝারি)', 'Whole red snapper grilled with herbs.', 'হার্বসহ গ্রিল করা আস্ত রেড স্ন্যাপার।', ONE(1350)],
  ['main-dishes', 'Special Crab Masala', 'স্পেশাল ক্র্যাব মসলা', 'Fresh crab in aromatic spicy masala gravy.', 'সুগন্ধি ঝাল মসলায় রান্না করা কাঁকড়া।', ONE(699), 1],
  ['main-dishes', 'Special Grilled King Prawn in Spicy Sauce (2 pcs)', 'স্পেশাল গ্রিলড কিং প্রন (ঝাল সস, ২ পিস)', 'Juicy king prawns grilled to perfection.', 'রসালো কিং প্রন, নিখুঁতভাবে গ্রিল করা।', ONE(899)],
  ['main-dishes', 'Special Chicken in Foil Paper', 'স্পেশাল চিকেন ইন ফয়েল পেপার', 'Tender chicken cooked sealed in foil.', 'ফয়েলে মুড়ে রান্না করা নরম চিকেন।', ONE(599)],
  ['main-dishes', 'Beijing Chicken (Gravy)', 'বেইজিং চিকেন (গ্রেভি)', 'Beijing-style gravy chicken.', 'বেইজিং স্টাইলের গ্রেভি চিকেন।', ONE(699)],

  ['seafood', 'Thai Deep Fried Pomfret with Onion Rings', 'থাই ডিপ ফ্রাইড পমফ্রেট (অনিয়ন রিং সহ)', 'Crispy pomfret with crunchy onion rings.', 'মচমচে পমফ্রেট, সাথে অনিয়ন রিং।', ONE(695)],
  ['seafood', 'Thai Fried Red Snapper with Hot / Garlic Sauce', 'থাই ফ্রাইড রেড স্ন্যাপার (হট / গার্লিক সস)', 'Medium red snapper fried with signature sauce.', 'বিশেষ সসে ভাজা মাঝারি আকারের রেড স্ন্যাপার।', ONE(1250)],
  ['seafood', 'Thai Prawn in Red Curry Sauce', 'থাই প্রন ইন রেড কারি সস', 'Prawns in authentic Thai red curry.', 'আসল থাই রেড কারিতে রান্না করা চিংড়ি।', ONE(599), 1],
  ['seafood', 'Thai Prawn with Mushroom & Oyster Sauce', 'থাই প্রন (মাশরুম ও অয়েস্টার সস)', 'Savory prawn stir-fry with mushrooms.', 'মাশরুমসহ সুস্বাদু চিংড়ি স্টার-ফ্রাই।', ONE(475)],
  ['seafood', 'Steamed Fish with Mushroom, Ginger & Lime', 'স্টিমড ফিশ (মাশরুম, আদা ও লেবু)', 'Boneless fish steamed with ginger and lime.', 'আদা ও লেবুর সুবাসে স্টিম করা কাঁটাহীন মাছ।', ONE(620)],

  ['beef', 'Thai Beef with Green Chilli & Spring Onion', 'থাই বিফ (কাঁচা মরিচ ও পেঁয়াজকলি)', 'Tender beef slices with fresh green chillies.', 'নরম বিফের টুকরো, সাথে তাজা কাঁচা মরিচ।', ONE(550)],
  ['beef', 'Thai Beef with Basil Leaf', 'থাই বিফ উইথ বেসিল লিফ', 'Fragrant basil stir-fried beef.', 'বেসিল পাতার সুবাসে স্টার-ফ্রাই করা বিফ।', ONE(550)],
  ['beef', 'Thai Beef with Mushroom & Ginger', 'থাই বিফ (মাশরুম ও আদা)', 'Juicy beef with mushrooms and ginger.', 'মাশরুম ও আদা দিয়ে রসালো বিফ।', ONE(560)],
  ['beef', 'Szechuan Beef Chilli Dry', 'সেজুয়ান বিফ চিলি ড্রাই', 'Dry-style spicy Szechuan beef.', 'ঝাল সেজুয়ান স্টাইলের ড্রাই বিফ।', ONE(550)],
  ['beef', 'Beef Masala', 'বিফ মসলা', 'Rich, spiced traditional beef masala.', 'ঘন মসলায় রান্না করা ঐতিহ্যবাহী বিফ।', HF(280, 550)],
  ['beef', 'Beef with Vegetables', 'বিফ উইথ ভেজিটেবল', 'Stir-fried beef with seasonal vegetables.', 'মৌসুমি সবজিসহ স্টার-ফ্রাই বিফ।', HF(320, 500)],

  ['chicken', 'Thai Fried Chicken (8 pcs)', 'থাই ফ্রাইড চিকেন (৮ পিস)', 'Crispy golden fried chicken.', 'সোনালি মচমচে ফ্রাইড চিকেন।', HF(300, 580), 1],
  ['chicken', 'Thai Grilled Chicken (8 pcs)', 'থাই গ্রিলড চিকেন (৮ পিস)', 'Juicy grilled chicken with Thai spices.', 'থাই মসলায় গ্রিল করা রসালো চিকেন।', ONE(599)],
  ['chicken', 'Thai Chicken with Cashew Nut', 'থাই চিকেন উইথ কাজুবাদাম', 'Stir-fried chicken with roasted cashews.', 'ভাজা কাজুবাদামসহ স্টার-ফ্রাই চিকেন।', ONE(580)],
  ['chicken', 'Thai Lemon Chicken', 'থাই লেমন চিকেন', 'Tender chicken with a zesty lemon flavour.', 'লেবুর ঝাঁঝালো স্বাদের নরম চিকেন।', ONE(540)],
  ['chicken', 'Szechuan Chicken Gravy / Beijing Style', 'সেজুয়ান চিকেন গ্রেভি / বেইজিং স্টাইল', 'Szechuan or Beijing-style gravy chicken.', 'সেজুয়ান বা বেইজিং স্টাইলের গ্রেভি চিকেন।', ONE(580)],

  ['rice-noodles', 'Red Carpet Special Mixed Fried Rice', 'রেড কার্পেট স্পেশাল মিক্সড ফ্রাইড রাইস', 'Signature fried rice with mixed meats, mushroom & baby corn.', 'মিক্সড মাংস, মাশরুম ও বেবি কর্নসহ স্পেশাল ফ্রাইড রাইস।', ONE(640), 1],
  ['rice-noodles', 'Special Pad Thai Noodle', 'স্পেশাল প্যাড থাই নুডল', 'Stir-fried noodles with chicken, prawn & cashew nut.', 'চিকেন, চিংড়ি ও কাজুবাদামসহ স্টার-ফ্রাই নুডলস।', ONE(580)],
  ['rice-noodles', 'Fried Rice with Egg', 'এগ ফ্রাইড রাইস', 'Classic egg fried rice.', 'ক্লাসিক ডিম ফ্রাইড রাইস।', HF(270, 450)],
  ['rice-noodles', 'Thai Fried Rice with Chicken / Prawn & Cashew Nut', 'থাই ফ্রাইড রাইস (চিকেন / প্রন ও কাজুবাদাম)', 'Thai-style fried rice.', 'থাই স্টাইলের ফ্রাইড রাইস।', ONE(550)],
  ['rice-noodles', 'Chowmein', 'চাউমিন', 'Stir-fried noodles with vegetables and meats.', 'সবজি ও মাংসসহ স্টার-ফ্রাই নুডলস।', HF(280, 440)],

  ['vegetables', 'Red Carpet Special Sizzling Beef / Prawn', 'রেড কার্পেট স্পেশাল সিজলিং বিফ / প্রন', 'Served piping hot on a sizzling plate.', 'গরম সিজলিং প্লেটে পরিবেশিত।', ONE(575), 1],
  ['vegetables', 'Special Mixed Seafood Sizzling', 'স্পেশাল মিক্সড সি-ফুড সিজলিং', 'Assorted seafood on a sizzling platter.', 'সিজলিং প্ল্যাটারে মিক্সড সি-ফুড।', ONE(599)],
  ['vegetables', 'Thai Mixed / Bangkok Style Vegetable', 'থাই মিক্সড / ব্যাংকক স্টাইল সবজি', 'Fresh mixed vegetables in Thai sauce.', 'থাই সসে তাজা মিক্সড সবজি।', ONE(480)],

  ['set-meals', 'Set For 1 (2 Person)', 'সেট ফর ১ (২ জনের)', 'Thai soup, chicken fried rice, chicken fry, vegetable, masala, soft drinks.', 'থাই স্যুপ, চিকেন ফ্রাইড রাইস, চিকেন ফ্রাই, সবজি, মসলা, soft drinks।', ONE(1150)],
  ['set-meals', 'Set For 2 (3 Person)', 'সেট ফর ২ (৩ জনের)', 'Thai soup, chicken fried rice, chicken fry, vegetable, masala, soft drinks.', 'থাই স্যুপ, চিকেন ফ্রাইড রাইস, চিকেন ফ্রাই, সবজি, মসলা, soft drinks।', ONE(1650)],
  ['set-meals', 'Set For 3 (4 Person)', 'সেট ফর ৩ (৪ জনের)', 'Thai soup, chicken fried rice, chicken fry, vegetable, masala, soft drinks.', 'থাই স্যুপ, চিকেন ফ্রাইড রাইস, চিকেন ফ্রাই, সবজি, মসলা, soft drinks।', ONE(2200)],
  ['set-meals', 'Set For You (6 Person)', 'সেট ফর ইউ (৬ জনের)', 'Special soup, fried wonton, fried rice, chicken fry, beef sizzling, vegetable, masala, soft drinks.', 'স্পেশাল স্যুপ, ফ্রাইড ওয়ানটন, ফ্রাইড রাইস, চিকেন ফ্রাই, বিফ সিজলিং, সবজি, মসলা, soft drinks।', ONE(4300)],
  ['set-meals', 'Set A (1 Person)', 'সেট এ (১ জনের)', 'Fried chicken (2 pcs), fried rice, chicken vegetable, drink / water.', 'ফ্রাইড চিকেন (২ পিস), ফ্রাইড রাইস, চিকেন ভেজিটেবল, ড্রিংকস / পানি।', ONE(350)],
  ['set-meals', 'Set B (1 Person)', 'সেট বি (১ জনের)', 'Masala chicken, fried rice, chicken vegetable, drink / water.', 'মসলা চিকেন, ফ্রাইড রাইস, চিকেন ভেজিটেবল, ড্রিংকস / পানি।', ONE(320)],

  ['fast-food', 'BBQ Chicken Pizza', 'বার্বিকিউ চিকেন পিৎজা', 'BBQ chicken and melted mozzarella.', 'বার্বিকিউ চিকেন আর গলানো মোজারেলা চিজ।', [{ label: L('৮ ইঞ্চি', '8"'), price: 450 }, { label: L('১০ ইঞ্চি', '10"'), price: 625 }, { label: L('১২ ইঞ্চি', '12"'), price: 800 }]],
  ['fast-food', 'Beef Pizza', 'বিফ পিৎজা', 'Savory minced beef with rich cheese.', 'মসলাদার কিমা বিফ আর প্রচুর চিজ।', [{ label: L('৮ ইঞ্চি', '8"'), price: 500 }, { label: L('১০ ইঞ্চি', '10"'), price: 700 }, { label: L('১২ ইঞ্চি', '12"'), price: 900 }]],
  ['fast-food', 'Red Carpet Special Pizza', 'রেড কার্পেট স্পেশাল পিৎজা', "Chef's signature loaded pizza.", 'শেফের নিজস্ব মাল্টি-টপিং পিৎজা।', [{ label: L('৮ ইঞ্চি', '8"'), price: 600 }, { label: L('১০ ইঞ্চি', '10"'), price: 795 }, { label: L('১২ ইঞ্চি', '12"'), price: 990 }], 1],
  ['fast-food', 'Crispy Chicken Burger', 'ক্রিস্পি চিকেন বার্গার', 'Crunchy chicken patty in a soft bun.', 'নরম বান-এ মচমচে চিকেন প্যাটি।', ONE(200)],
  ['fast-food', 'Beef Burger', 'বিফ বার্গার', 'Juicy flame-grilled beef burger.', 'রসালো গ্রিলড বিফ বার্গার।', ONE(220)],
  ['fast-food', 'Chicken Cheese Burger', 'চিকেন চিজ বার্গার', 'Chicken burger with extra melted cheese.', 'বাড়তি চিজসহ চিকেন বার্গার।', ONE(280)],
  ['fast-food', 'Sub Sandwich', 'সাব স্যান্ডউইচ', 'Fresh sub sandwich.', 'তাজা ফিলিংসহ সাব স্যান্ডউইচ।', ONE(310)],
  ['fast-food', 'Chicken Pasta / Beef Pasta', 'চিকেন পাস্তা / বিফ পাস্তা', 'Creamy Italian-style pasta.', 'ক্রিমি ইতালিয়ান স্টাইলের পাস্তা।', [{ label: L('চিকেন', 'Chicken'), price: 300 }, { label: L('বিফ', 'Beef'), price: 350 }]],

  ['khichuri', 'Chicken Khichuri (Full)', 'চিকেন খিচুড়ি (ফুল)', 'Comforting spiced khichuri with chicken.', 'চিকেনসহ মসলাদার আরামের খিচুড়ি।', ONE(250), 1],
  ['khichuri', 'Beef Khichuri (Full)', 'বিফ খিচুড়ি (ফুল)', 'Rich, flavourful beef khichuri.', 'ঘন স্বাদের বিফ খিচুড়ি।', ONE(300)]
];

export const DEFAULT_MENU = M.map((m, i) => ({
  id: 'd' + String(i + 1).padStart(3, '0'),
  cat: m[0], name: L(m[2], m[1]), desc: L(m[4], m[3]), variants: m[5],
  image: '', available: true, featured: !!m[6], order: i
}));

export const DEFAULT_GALLERY = [
  ['photo-1519741497674-611481863552', 'বিয়ের সাজ', 'Wedding setup'],
  ['photo-1555396273-367ea4eb4db5', 'রেস্টুরেন্টের পরিবেশ', 'Restaurant dining'],
  ['photo-1544025162-d76694265947', 'সুস্বাদু খাবার', 'Delicious food'],
  ['photo-1511578314322-379afb476865', 'কনভেনশন হল', 'Convention hall'],
  ['photo-1517248135467-4c7edcad34c4', 'বুফে আয়োজন', 'Buffet setup'],
  ['photo-1465495976277-4387d4b0b4c6', 'খোলা আকাশের উদযাপন', 'Outdoor celebration']
].map((g, i) => ({ id: 'g' + (i + 1), src: `https://images.unsplash.com/${g[0]}?auto=format&fit=crop&q=80&w=900`, caption: L(g[1], g[2]), order: i }));
