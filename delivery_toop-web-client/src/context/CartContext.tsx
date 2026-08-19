import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api'

interface CartItem {
  _id: string
  product: string
  name: string
  price: number
  quantity: number
  total: number
  notes?: string
}

interface Cart {
  _id: string
  customer: string
  company: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: string
}

interface CartContextType {
  cart: Cart | null
  companyId: string | null
  itemCount: number
  addItem: (companyId: string, productId: string, quantity: number, notes?: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  setCompanyId: (id: string | null) => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>(null!)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(() => localStorage.getItem('cartCompanyId'))

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const refreshCart = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await api.get(`/cart/${companyId}`)
      setCart(data.data)
    } catch {
      setCart(null)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      localStorage.setItem('cartCompanyId', companyId)
      refreshCart()
    } else {
      localStorage.removeItem('cartCompanyId')
      setCart(null)
    }
  }, [companyId, refreshCart])

  const addItem = useCallback(
    async (compId: string, productId: string, quantity: number, notes?: string) => {
      const { data } = await api.post(`/cart/${compId}/items`, { productId, quantity, notes })
      setCart(data.data)
      setCompanyId(compId)
    },
    [],
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cart) return
      const { data } = await api.delete(`/cart/${cart._id}/items/${itemId}`)
      setCart(data.data)
    },
    [cart],
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) return
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }
      const { data } = await api.put(`/cart/${cart._id}/items/${itemId}`, { quantity })
      setCart(data.data)
    },
    [cart, removeItem],
  )

  const clearCart = useCallback(() => {
    setCart(null)
    setCompanyId(null)
    localStorage.removeItem('cartCompanyId')
  }, [])

  return (
    <CartContext.Provider
      value={{ cart, companyId, itemCount, addItem, removeItem, updateQuantity, clearCart, setCompanyId, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
