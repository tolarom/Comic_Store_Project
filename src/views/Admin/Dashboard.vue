<template>
  <div>
    <AdminNav />
    <div class="p-6 bg-gray-100 min-h-screen pt-6 ml-[250px] mt-10">
      <!-- Breadcrumb -->
      <div class="mb-2 text-sm text-gray-600 animate-fadeIn">
        <i class="pi pi-home"></i> › Dashboard
      </div>

      <!-- Header -->
      <div class="mb-6 animate-fadeIn">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p class="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Total Revenue -->
        <div
          class="bg-white rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-600 text-sm mb-1">Total Revenue</p>
              <h2 class="text-3xl font-bold text-gray-800">
                ${{ formatNumber(stats.totalRevenue) }}
              </h2>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="pi pi-dollar text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div
          class="bg-white rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-600 text-sm mb-1">Active Users</p>
              <h2 class="text-3xl font-bold text-gray-800">
                {{ stats.activeUsers.toLocaleString() }}
              </h2>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="pi pi-users text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Sold Chart -->
      <div class="bg-white rounded-lg p-6 shadow-sm mb-6 animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Items Sold</h3>
        <div style="height: 300px; position: relative;">
          <canvas ref="itemsSoldChart"></canvas>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Orders -->
        <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Recent Orders</h3>
          <div class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between py-3 border-b last:border-b-0 animate-fadeIn"
            >
              <div>
                <p class="font-medium text-gray-800">{{ order.customer }}</p>
                <p class="text-sm text-gray-500">{{ order.product }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-800">${{ order.amount }}</p>
                <span :class="getStatusClass(order.status)" class="text-xs px-2 py-1 rounded">
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Top Products</h3>
          <div class="space-y-4">
            <div
              v-for="product in topProducts"
              :key="product.id"
              class="flex items-center justify-between py-3 border-b last:border-b-0 animate-fadeIn"
            >
              <div>
                <p class="font-medium text-gray-800">{{ product.name }}</p>
                <p class="text-sm text-gray-500">{{ product.sales }} sales</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-800">${{ formatNumber(product.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Chart from 'chart.js/auto'
import AdminNav from '../../components/Admin/NavigationBar.vue'
import { getAllOrders, getAllProducts, getAllUsers } from '../../services/api'

export default {
  name: 'AdminDashboard',
  components: { AdminNav },
  setup() {
    const itemsSoldChart = ref<HTMLCanvasElement | null>(null)
    let itemsSoldChartInstance: any = null

    const stats = ref({ totalRevenue: 0, activeUsers: 0 })
    const recentOrders = ref<any[]>([])
    const topProducts = ref<Array<{ name: string; sales: number; revenue: number }>>([])

    const initializeCharts = () => {
      if (itemsSoldChartInstance) itemsSoldChartInstance.destroy()

      if (itemsSoldChart.value) {
        itemsSoldChartInstance = new Chart(itemsSoldChart.value, {
          type: 'bar',
          data: {
            labels: topProducts.value.map((p) => p.name),
            datasets: [
              {
                label: 'Units Sold',
                data: topProducts.value.map((p) => p.sales),
                backgroundColor: topProducts.value.map((_, i) => ['#3b82f6', '#10b981', '#f59e0b'][i % 3]),
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } },
          },
        })
      }
    }

    const loadData = async () => {
      try {
        const [ordersResp, productsResp, usersResp] = await Promise.all([
          getAllOrders().catch(() => []),
          getAllProducts().catch(() => []),
          getAllUsers().catch(() => []),
        ])

        const orders = ordersResp || []
        const products = productsResp || []
        const users = usersResp || []

        // Create product ID -> Product lookup map
        const productMap: Record<string, any> = {}
        products.forEach((p: any) => {
          // Handle _id that might be object or string
          let id = ''
          if (p._id) {
            id = typeof p._id === 'object' ? (p._id.$oid || String(p._id)) : String(p._id)
          } else if (p.id) {
            id = typeof p.id === 'object' ? (p.id.$oid || String(p.id)) : String(p.id)
          }
          if (id) {
            productMap[id] = p
          }
        })

        // Create user ID -> Name lookup map
        const userMap: Record<string, string> = {}
        users.forEach((u: any) => {
          let id = ''
          if (u._id) {
            id = typeof u._id === 'object' ? (u._id.$oid || String(u._id)) : String(u._id)
          } else if (u.id) {
            id = typeof u.id === 'object' ? (u.id.$oid || String(u.id)) : String(u.id)
          }
          const name = u.full_name || u.username || u.email || 'Unknown User'
          if (id) {
            userMap[id] = name
          }
        })

        // total revenue
        stats.value.totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.total_amount || o.total_price || 0), 0)

        // active users
        stats.value.activeUsers = users.filter((u: any) => {
          const s = String(u.status || u.active || '').toLowerCase()
          return s === 'active' || s === 'true'
        }).length

        // recent orders (most recent 5)
        const sorted = [...orders].sort((a: any, b: any) => {
          const da = new Date(a.created_at || a.createdAt || 0).getTime()
          const db = new Date(b.created_at || b.createdAt || 0).getTime()
          return db - da
        })

        recentOrders.value = sorted.slice(0, 5).map((o: any) => {
          // Get items from order
          const items = o.items || o.products || []
          const firstItem = items[0]
          
          // Get product name from first item
          let productDisplay = 'No items'
          if (firstItem) {
            const productId = String(firstItem.product_id || '')
            const product = productMap[productId]
            const productName = product ? (product.title || 'Unknown Product') : 'Unknown Product'
            productDisplay = items.length > 1 ? `${productName} (+${items.length - 1} more)` : productName
          }

          // Get customer name
          const userId = String(o.user_id || '')
          const customerName = userMap[userId] || 'Unknown Customer'

          return {
            id: o._id || o.id,
            customer: customerName,
            product: productDisplay,
            amount: ((o.total_amount || o.total_price) || 0).toFixed(2),
            status: o.status || 'pending',
          }
        })

        // top products (aggregate from orders)
        const prodMap: Record<string, { name: string; sales: number; revenue: number }> = {}
        orders.forEach((o: any) => {
          const items = o.items || o.products || []
          items.forEach((it: any) => {
            const productId = String(it.product_id || '')
            const product = productMap[productId]
            const name = product ? (product.title || 'Unknown Product') : 'Unknown Product'
            const qty = Number(it.quantity || 1)
            const price = Number(it.price || 0)
            
            if (!prodMap[name]) prodMap[name] = { name, sales: 0, revenue: 0 }
            prodMap[name].sales += qty
            prodMap[name].revenue += qty * price
          })
        })

        const prodList = Object.values(prodMap)
          .sort((a, b) => {
            // Sort by sales first (descending), then by revenue (descending)
            if (b.sales !== a.sales) {
              return b.sales - a.sales
            }
            return b.revenue - a.revenue
          })
          .slice(0, 5)
        topProducts.value = prodList

        console.log('Dashboard - Top Products:', prodList)

        // initialize chart after data is ready
        setTimeout(() => initializeCharts(), 50)
      } catch (e) {
        // Failed to load dashboard data
      }
    }

    onMounted(() => {
      loadData()
    })

    onBeforeUnmount(() => {
      if (itemsSoldChartInstance) itemsSoldChartInstance.destroy()
    })

    const formatNumber = (num: number) => {
      return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const getStatusClass = (status: string) => {
      return status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }

    return {
      itemsSoldChart,
      stats,
      recentOrders,
      topProducts,
      formatNumber,
      getStatusClass,
    }
  },
}
</script>

<style scoped>
/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
