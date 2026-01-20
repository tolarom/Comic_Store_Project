import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserItem {
  id: number
  name: string
  email: string
  password?: string
  role: 'Customer' | 'Admin'
  status: 'Active' | 'Blocked'
  phone?: string
  address?: string
  joinedDate: string
  lastLogin?: string
  totalOrders?: number
  totalSpent?: number
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserItem[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashed_password_123',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      joinedDate: '2024-01-15',
      lastLogin: '2026-01-19',
      totalOrders: 12,
      totalSpent: 456.78,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'hashed_password_456',
      role: 'Admin',
      status: 'Active',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      joinedDate: '2023-11-20',
      lastLogin: '2026-01-20',
      totalOrders: 0,
      totalSpent: 0,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      password: 'hashed_password_789',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Chicago, IL 60601',
      joinedDate: '2024-02-10',
      lastLogin: '2026-01-18',
      totalOrders: 8,
      totalSpent: 234.5,
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      password: 'hashed_password_012',
      role: 'Customer',
      status: 'Blocked',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Houston, TX 77001',
      joinedDate: '2023-12-05',
      lastLogin: '2025-12-20',
      totalOrders: 3,
      totalSpent: 89.99,
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      password: 'hashed_password_345',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Phoenix, AZ 85001',
      joinedDate: '2024-03-12',
      lastLogin: '2026-01-19',
      totalOrders: 15,
      totalSpent: 678.9,
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      password: 'hashed_password_678',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Philadelphia, PA 19101',
      joinedDate: '2024-01-28',
      lastLogin: '2026-01-17',
      totalOrders: 6,
      totalSpent: 189.45,
    },
    {
      id: 7,
      name: 'Robert Martinez',
      email: 'robert.martinez@example.com',
      password: 'hashed_password_901',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 789-0123',
      address: '147 Birch Ave, San Antonio, TX 78201',
      joinedDate: '2023-10-15',
      lastLogin: '2026-01-16',
      totalOrders: 22,
      totalSpent: 1234.67,
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      password: 'hashed_password_234',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 890-1234',
      address: '258 Willow Way, San Diego, CA 92101',
      joinedDate: '2024-02-20',
      lastLogin: '2026-01-20',
      totalOrders: 9,
      totalSpent: 345.88,
    },
    {
      id: 9,
      name: 'James Taylor',
      email: 'james.taylor@example.com',
      password: 'hashed_password_567',
      role: 'Customer',
      status: 'Blocked',
      phone: '+1 (555) 901-2345',
      address: '369 Spruce St, Dallas, TX 75201',
      joinedDate: '2023-09-08',
      lastLogin: '2025-11-15',
      totalOrders: 2,
      totalSpent: 45.99,
    },
    {
      id: 10,
      name: 'Jennifer White',
      email: 'jennifer.white@example.com',
      password: 'hashed_password_890',
      role: 'Customer',
      status: 'Active',
      phone: '+1 (555) 012-3456',
      address: '741 Ash Blvd, San Jose, CA 95101',
      joinedDate: '2024-03-05',
      lastLogin: '2026-01-19',
      totalOrders: 11,
      totalSpent: 567.34,
    },
  ])

  const getById = (id: number) => users.value.find((u) => u.id === id)

  const getByEmail = (email: string) =>
    users.value.find((u) => u.email.toLowerCase() === email.toLowerCase())

  const addUser = (user: Omit<UserItem, 'id'>) => {
    const newUser: UserItem = {
      ...user,
      id: Math.max(...users.value.map((u) => u.id), 0) + 1,
    }
    users.value.push(newUser)
    return newUser
  }

  const updateUser = (id: number, updates: Partial<UserItem>) => {
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates }
      return users.value[index]
    }
    return null
  }

  const deleteUser = (id: number) => {
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
      return true
    }
    return false
  }

  const toggleUserStatus = (id: number) => {
    const user = getById(id)
    if (user) {
      user.status = user.status === 'Active' ? 'Blocked' : 'Active'
      return user
    }
    return null
  }

  const authenticate = (email: string, password: string) => {
    const user = getByEmail(email)
    if (user && user.password === password && user.status === 'Active') {
      return user
    }
    return null
  }

  return {
    users,
    getById,
    getByEmail,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    authenticate,
  }
})
