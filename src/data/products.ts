import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ProductItem {
  id: number
  title: string
  subtitle: string
  price: number
  discount: number
  rating: number
  image: string
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<ProductItem[]>([
    { id: 1, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 2, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
    { id: 3, title: 'Spider-Man Funko Pop', subtitle: 'Collectible figure', price: 12.5, discount: 5, rating: 4.0, image: 'https://via.placeholder.com/270x150?text=Spider-Man' },
    { id: 4, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 5, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
    { id: 6, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 7, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
    { id: 8, title: 'Spider-Man Funko Pop', subtitle: 'Collectible figure', price: 12.5, discount: 5, rating: 4.0, image: 'https://via.placeholder.com/270x150?text=Spider-Man' },
    { id: 9, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 10, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
    { id: 11, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 12, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
    { id: 13, title: 'Spider-Man Funko Pop', subtitle: 'Collectible figure', price: 12.5, discount: 5, rating: 4.0, image: 'https://via.placeholder.com/270x150?text=Spider-Man' },
    { id: 14, title: 'Batman: The Killing Joke', subtitle: 'A graphic novel by Alan Moore', price: 15.99, discount: 10, rating: 4.5, image: 'https://img.freepik.com/free-photo/shirt-mockup-concept-with-plain-clothing_23-2149448751.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 15, title: 'One Piece Vol. 100', subtitle: 'Manga volume 100', price: 9.99, discount: 0, rating: 5.0, image: 'https://via.placeholder.com/270x150?text=One+Piece' },
  ])

  const getById = (id: number) => products.value.find(p => p.id === id)

  const discountedPriceById = (id: number) => {
    const p = getById(id)
    if (!p) return 0
    return p.discount ? Number((p.price * (1 - p.discount / 100)).toFixed(2)) : p.price
  }

  return { products, getById, discountedPriceById }
})
