import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import api from '../api'
import { useAuth } from './AuthContext'

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
  addItem: (
    companyId: string,
    productId: string,
    quantity: number,
    notes?: string,
    meta?: { name?: string; price?: number },
  ) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  setCompanyId: (id: string | null) => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>(null!)

const LOCAL_CART_KEY = 'localCart'
const LOCAL_COMPANY_KEY = 'localCartCompany'

interface LocalLine {
  _id: string
  product: string
  name: string
  price: number
  quantity: number
  total: number
  notes?: string
}

interface LocalCartPayload {
  companyId: string
  items: LocalLine[]
}

function loadLocalCart(): LocalCartPayload | null {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const isAuthed = Boolean(token)

  const [cart, setCart] = useState<Cart | null>(null)
  const [localCart, setLocalCart] = useState<LocalCartPayload | null>(loadLocalCart)
  const [companyId, setCompanyId] = useState<string | null>(() => {
    if (localStorage.getItem('token')) {
      return localStorage.getItem('cartCompanyId')
    }
    return localStorage.getItem(LOCAL_COMPANY_KEY)
  })

  const needsSync = useRef(false)

  const itemCount = isAuthed
    ? cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
    : localCart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  // Effective cart exposed to consumers (server cart when authed, local cart when not)
  const effectiveCart: Cart | null = isAuthed
    ? cart
    : localCart && localCart.items.length > 0
      ? {
          _id: 'local',
          customer: '',
          company: localCart.companyId,
          items: localCart.items as CartItem[],
          subtotal: localCart.items.reduce((s, i) => s + i.total, 0),
          deliveryFee: 0,
          discount: 0,
          total: localCart.items.reduce((s, i) => s + i.total, 0),
          status: 'local',
        }
      : null

  // Persist local cart
  useEffect(() => {
    if (!isAuthed) {
      if (localCart && localCart.items.length > 0) {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localCart))
        if (localCart.companyId) localStorage.setItem(LOCAL_COMPANY_KEY, localCart.companyId)
      } else {
        localStorage.removeItem(LOCAL_CART_KEY)
        localStorage.removeItem(LOCAL_COMPANY_KEY)
      }
    }
  }, [localCart, isAuthed])

  // When auth state changes
  useEffect(() => {
    if (isAuthed) {
      setCompanyId(localStorage.getItem('cartCompanyId'))
      if (localCart && localCart.items.length > 0) {
        needsSync.current = true
      }
    } else {
      setCart(null)
      const stored = loadLocalCart()
      setLocalCart(stored)
      setCompanyId(stored?.companyId ?? null)
    }
  }, [isAuthed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local cart to server after login
  const syncLocalCart = useCallback(async () => {
    if (!localCart || localCart.items.length === 0 || !needsSync.current) return
    needsSync.current = false
    const compId = localCart.companyId
    try {
      setCompanyId(compId)
      for (const line of localCart.items) {
        await api.post(`/cart/${compId}/items`, {
          productId: line.product,
          quantity: line.quantity,
          notes: line.notes,
        })
      }
      localStorage.removeItem(LOCAL_CART_KEY)
      localStorage.removeItem(LOCAL_COMPANY_KEY)
      setLocalCart(null)
      const { data } = await api.get(`/cart/${compId}`)
      setCart(data.data)
    } catch {
      // keep local cart if sync failed
      needsSync.current = true
    }
  }, [localCart])

  useEffect(() => {
    if (isAuthed && needsSync.current) {
      syncLocalCart()
    }
  }, [isAuthed, syncLocalCart])

  const refreshCart = useCallback(async () => {
    if (!isAuthed || !companyId) return
    try {
      const { data } = await api.get(`/cart/${companyId}`)
      setCart(data.data)
    } catch {
      setCart(null)
    }
  }, [isAuthed, companyId])

  useEffect(() => {
    if (isAuthed && companyId) {
      localStorage.setItem('cartCompanyId', companyId)
      refreshCart()
    } else if (!isAuthed && companyId) {
      localStorage.setItem(LOCAL_COMPANY_KEY, companyId)
    }
  }, [companyId, refreshCart, isAuthed])

  const addItem = useCallback(
    async (compId: string, productId: string, quantity: number, notes?: string, meta?: { name?: string; price?: number }) => {
      if (!isAuthed) {
        setCompanyId(compId)
        const price = meta?.price ?? 0
        const name = meta?.name || 'Item'
        const notesKey = notes || ''
        setLocalCart((prev) => {
          const current = prev?.companyId === compId ? prev : { companyId: compId, items: [] }
          const id = `${productId}__${notesKey}`
          const existing = current.items.find((i) => i._id === id)
          if (existing) {
            existing.quantity += quantity
            existing.total = existing.quantity * existing.price
          } else {
            current.items.push({
              _id: id,
              product: productId,
              name,
              price,
              quantity,
              total: quantity * price,
              notes: notes || undefined,
            })
          }
          return { ...current, items: [...current.items] }
        })
        return
      }
      const { data } = await api.post(`/cart/${compId}/items`, { productId, quantity, notes })
      setCart(data.data)
      setCompanyId(compId)
    },
    [isAuthed],
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!isAuthed) {
        setLocalCart((prev) => {
          if (!prev) return prev
          return { ...prev, items: prev.items.filter((i) => i._id !== itemId) }
        })
        return
      }
      if (!cart) return
      const { data } = await api.delete(`/cart/${cart._id}/items/${itemId}`)
      setCart(data.data)
    },
    [isAuthed, cart],
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!isAuthed) {
        if (quantity <= 0) {
          setLocalCart((prev) => {
            if (!prev) return prev
            return { ...prev, items: prev.items.filter((i) => i._id !== itemId) }
          })
          return
        }
        setLocalCart((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            items: prev.items.map((i) =>
              i._id === itemId ? { ...i, quantity, total: quantity * i.price } : i,
            ),
          }
        })
        return
      }
      if (!cart) return
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }
      const { data } = await api.put(`/cart/${cart._id}/items/${itemId}`, { quantity })
      setCart(data.data)
    },
    [isAuthed, cart, removeItem],
  )

  const clearCart = useCallback(() => {
    setCart(null)
    setLocalCart(null)
    setCompanyId(null)
    localStorage.removeItem('cartCompanyId')
    localStorage.removeItem(LOCAL_CART_KEY)
    localStorage.removeItem(LOCAL_COMPANY_KEY)
  }, [])

  return (
    <CartContext.Provider
      value={{ cart: effectiveCart, companyId, itemCount, addItem, removeItem, updateQuantity, clearCart, setCompanyId, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
