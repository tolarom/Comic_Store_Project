import promo1 from '@/assets/promo1.png'
import promo2 from '@/assets/promo2.png'
import promo3 from '@/assets/promo3.png'

export interface SlideData {
  title: string
  subtitle: string
  bg: string
  image: string
}

export const sliderData: SlideData[] = [
  {
    title: 'Up to 30% offer',
    subtitle: 'Enjoy our big offer',
    bg: '#ffffff',
    image: promo1,
  },
  {
    title: 'Mid - Year Discount',
    subtitle: 'Enjoy our big offer',
    bg: '#c13b3b',
    image: promo2,
  },
  {
    title: 'Up to 30% offer',
    subtitle: 'Enjoy our big offer',
    bg: '#55c53a',
    image: promo3,
  },
  {
    title: 'Up to 30% offer',
    subtitle: 'Enjoy our big offer',
    bg: '#55c53a',
    image: promo3,
  },
]
