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
import { useUsersStore } from '../../data/users'

export default {
  name: 'AdminDashboard',
  components: {
    AdminNav,
  },
  setup() {
    const usersStore = useUsersStore()
    const activeUsersCount = usersStore.users.filter((user) => user.status === 'Active').length
    const itemsSoldChart = ref(null)
    let itemsSoldChartInstance = null

    const topProducts = [
      { id: 1, name: 'Comic Book', sales: 168, revenue: 5038.32, change: 12.5 },
      { id: 2, name: 'Gojo T-Shirt', sales: 150, revenue: 10498.5, change: 8.3 },
      { id: 3, name: 'Anime Figures', sales: 100, revenue: 13836.0, change: -3.2 },
    ]

    const initializeCharts = () => {
      if (itemsSoldChartInstance) itemsSoldChartInstance.destroy()

      if (itemsSoldChart.value) {
        itemsSoldChartInstance = new Chart(itemsSoldChart.value, {
          type: 'bar',
          data: {
            labels: topProducts.map(p => p.name),
            datasets: [
              {
                label: 'Units Sold',
                data: topProducts.map(p => p.sales),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderRadius: 6,
                borderSkipped: false,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
              }
            }
          }
        })
      }
    }

    onMounted(() => {
      setTimeout(() => {
        initializeCharts()
      }, 100)
    })

    onBeforeUnmount(() => {
      if (itemsSoldChartInstance) itemsSoldChartInstance.destroy()
    })

    return {
      itemsSoldChart,
      stats: {
        totalRevenue: 45231.89,
        activeUsers: activeUsersCount,
      },
      recentOrders: [
        {
          id: 1,
          customer: 'John Doe',
          product: 'Comic Book',
          amount: '29.99',
          status: 'completed',
        },
        {
          id: 2,
          customer: 'Jane Smith',
          product: 'Gojo T-Shirt',
          amount: '69.99',
          status: 'pending',
        },
        {
          id: 3,
          customer: 'Bob Johnson',
          product: 'Anime Figures',
          amount: '138.36',
          status: 'completed',
        },
      ],
      topProducts,
    }
  },
  methods: {
    formatNumber(num) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    getStatusClass(status) {
      return status === 'completed'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    },
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
