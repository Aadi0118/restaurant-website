export interface SignatureDishOption {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  notes: string;
  glazeColor: string;
  goldFlakes: boolean;
  accentLight: string;
  price: string;
  pairing: string;
  image: string;
  dishType: 'paneer' | 'biryani' | 'kofta' | 'chole' | 'general';
}

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: string;
  tag?: string;
  pairing?: string;
  isChefSpecial?: boolean;
  isVegetarian?: boolean;
}

export interface ReservationData {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  seating?: string;
  experience: string;
  specialRequests?: string;
}
