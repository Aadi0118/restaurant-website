export interface FeaturedDish {
  id: string;
  name: string;
  price: number;
  image: string;
  tag: string;
  subtitle: string;
  description: string;
  category?: string;
  accentColor?: string;
}

export const FEATURED_DISHES: FeaturedDish[] = [
  {
    id: 'paneer-lababdar',
    name: 'Paneer Lababdar',
    price: 260,
    image: '/assets/paneer_lababdar.png',
    tag: "Chef's Signature Delight",
    subtitle: 'Rich Malai Gravy • Kasuri Methi • Artisanal Cottage Cheese',
    description: 'Soft artisanal cottage cheese simmered in a rich tomato, butter, and cashew gravy, delicately finished with fresh cream, royal spices, and chopped cilantro.',
    category: 'Main Course',
    accentColor: '#E28743'
  },
  {
    id: 'veg-biryani',
    name: 'Veg Biriyani',
    price: 200,
    image: '/assets/veg_biryani.png',
    tag: 'Royal Awadhi Dum Special',
    subtitle: 'Aged Basmati • Kashmiri Saffron • Garden Fresh Vegetables',
    description: 'Slow-steamed in sealed vessels over gentle embers. Fragrant long-grain Basmati rice infused with whole aromatic spices, garden vegetables, caramelized onions, and mint.',
    category: 'Biryani & Rice',
    accentColor: '#DEC085'
  },
  {
    id: 'chole-bhature',
    name: 'Chole Bhature',
    price: 90,
    image: '/assets/chole_bhature.png',
    tag: 'Traditional Hearth Classic',
    subtitle: 'Pindi Spiced Chickpeas • Crisp Puffed Golden Bhature • Pickled Onions',
    description: 'Slow-cooked spiced chickpeas infused with dried pomegranate seeds and authentic secret garam masalas, accompanied by hot, fluffy golden bhature and freshly diced herbs.',
    category: 'Traditional Signatures',
    accentColor: '#C9A86B'
  }
];
