import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ProductItem {
  id: number
  title: string
  subtitle: string
  description?: string
  price: number
  discount: number
  rating: number
  reviewCount?: number
  image: string
  category?: string
  stock?: number
  sales?: number
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<ProductItem[]>([
    {
      id: 1,
      title: 'Batman: The Killing Joke',
      subtitle: 'A graphic novel by Alan Moore',
      description:
        'A dark, character-driven story exploring the Joker and Batman with striking visuals.',
      price: 15.99,
      discount: 10,
      rating: 4.5,
      reviewCount: 342,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'comics',
      stock: 45,
      sales: 125,
    },
    {
      id: 2,
      title: 'One Piece Vol. 100',
      subtitle: 'Manga volume 100',
      description: 'Milestone volume in the epic adventure of Luffy and the Straw Hat Pirates.',
      price: 9.99,
      discount: 0,
      rating: 5.0,
      reviewCount: 876,
      image: 'https://via.placeholder.com/270x150?text=One+Piece',
      category: 'manga',
      stock: 60,
      sales: 200,
    },
    {
      id: 3,
      title: 'Spider-Man Funko Pop',
      subtitle: 'Collectible figure',
      description: 'A stylized vinyl collectible featuring everyone’s favorite web-slinger.',
      price: 12.5,
      discount: 5,
      rating: 4.0,
      reviewCount: 128,
      image: 'https://via.placeholder.com/270x150?text=Spider-Man',
      category: 'merchandise',
      stock: 30,
      sales: 85,
    },
    {
      id: 4,
      title: 'Watchmen',
      subtitle: 'Graphic novel by Alan Moore',
      description: 'A genre-defining graphic novel with complex themes and iconic art.',
      price: 19.99,
      discount: 15,
      rating: 4.8,
      reviewCount: 521,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'graphic-novels',
      stock: 38,
      sales: 150,
    },
    {
      id: 5,
      title: 'Naruto Vol. 72',
      subtitle: 'Final volume of Naruto',
      description: 'The conclusion to Naruto’s journey with emotional battles and resolutions.',
      price: 9.99,
      discount: 0,
      rating: 4.9,
      reviewCount: 654,
      image: 'https://via.placeholder.com/270x150?text=Naruto',
      category: 'manga',
      stock: 55,
      sales: 180,
    },
    {
      id: 6,
      title: 'Superman T-Shirt',
      subtitle: 'Official DC merchandise',
      description: 'Comfortable cotton tee featuring the classic Superman emblem.',
      price: 24.99,
      discount: 20,
      rating: 4.3,
      reviewCount: 203,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'merchandise',
      stock: 75,
      sales: 95,
    },
    {
      id: 7,
      title: 'Attack on Titan Vol. 34',
      subtitle: 'Final volume',
      description: 'The climactic finale packed with revelations and intense storytelling.',
      price: 11.99,
      discount: 0,
      rating: 5.0,
      reviewCount: 932,
      image: 'https://via.placeholder.com/270x150?text=AOT',
      category: 'manga',
      stock: 42,
      sales: 220,
    },
    {
      id: 8,
      title: 'The Walking Dead Compendium',
      subtitle: 'Complete collection',
      description: 'A comprehensive compendium collecting major arcs in the survival saga.',
      price: 59.99,
      discount: 10,
      rating: 4.7,
      reviewCount: 287,
      image: 'https://via.placeholder.com/270x150?text=TWD',
      category: 'comics',
      stock: 25,
      sales: 65,
    },
    {
      id: 9,
      title: 'Sandman Vol. 1',
      subtitle: 'Preludes and Nocturnes',
      description: 'The beginning of a visionary series blending myth, fantasy, and drama.',
      price: 16.99,
      discount: 5,
      rating: 4.9,
      reviewCount: 445,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'graphic-novels',
      stock: 50,
      sales: 140,
    },
    {
      id: 10,
      title: 'My Hero Academia Vol. 35',
      subtitle: 'Latest volume',
      description: 'Heroic action continues with new challenges for Class 1-A.',
      price: 9.99,
      discount: 0,
      rating: 4.6,
      reviewCount: 589,
      image: 'https://via.placeholder.com/270x150?text=MHA',
      category: 'manga',
      stock: 68,
      sales: 175,
    },
    {
      id: 11,
      title: 'X-Men Classic Comics Bundle',
      subtitle: '10 classic issues',
      description: 'A curated bundle of memorable X-Men stories from past eras.',
      price: 29.99,
      discount: 25,
      rating: 4.4,
      reviewCount: 176,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'comics',
      stock: 20,
      sales: 55,
    },
    {
      id: 12,
      title: 'Demon Slayer Vol. 23',
      subtitle: 'Final volume',
      description: 'Final battles and heartfelt moments conclude Tanjiro’s journey.',
      price: 9.99,
      discount: 0,
      rating: 5.0,
      reviewCount: 1043,
      image: 'https://via.placeholder.com/270x150?text=Demon+Slayer',
      category: 'manga',
      stock: 80,
      sales: 250,
    },
    {
      id: 13,
      title: 'Batman Collectible Statue',
      subtitle: 'Limited edition',
      description: 'Premium collectible statue with meticulous detailing for display.',
      price: 89.99,
      discount: 0,
      rating: 4.8,
      reviewCount: 94,
      image: 'https://via.placeholder.com/270x150?text=Batman+Statue',
      category: 'merchandise',
      stock: 15,
      sales: 40,
    },
    {
      id: 14,
      title: 'Maus',
      subtitle: 'Pulitzer Prize winning graphic novel',
      description: 'A powerful, poignant narrative presented through graphic storytelling.',
      price: 17.99,
      discount: 10,
      rating: 5.0,
      reviewCount: 389,
      image:
        'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80',
      category: 'graphic-novels',
      stock: 35,
      sales: 110,
    },
    {
      id: 15,
      title: 'Jujutsu Kaisen Vol. 20',
      subtitle: 'Popular shonen manga',
      description:
        'Supernatural battles and character growth continue in this action-packed volume.',
      price: 9.99,
      discount: 0,
      rating: 4.7,
      reviewCount: 721,
      image: 'https://via.placeholder.com/270x150?text=JJK',
      category: 'manga',
      stock: 65,
      sales: 195,
    },
  ])

  const getById = (id: number) => products.value.find((p) => p.id === id)

  const discountedPriceById = (id: number) => {
    const p = getById(id)
    if (!p) return 0
    return p.discount ? Number((p.price * (1 - p.discount / 100)).toFixed(2)) : p.price
  }

  return { products, getById, discountedPriceById }
})
