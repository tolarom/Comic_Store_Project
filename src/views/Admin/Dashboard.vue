<template>
  <div>
    <AdminNav/>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Total Revenue -->
        <div class="bg-white rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-600 text-sm mb-1">Total Revenue</p>
              <h2 class="text-3xl font-bold text-gray-800">${{ formatNumber(stats.totalRevenue) }}</h2>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="pi pi-dollar text-green-600 text-xl"></i>
            </div>
          </div>
          <div class="flex items-center text-sm">
            <span class="text-green-600 flex items-center">
              <i class="pi pi-arrow-up mr-1"></i>
              {{ stats.revenueChange }}%
            </span>
            <span class="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-white rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-600 text-sm mb-1">Active Users</p>
              <h2 class="text-3xl font-bold text-gray-800">{{ formatNumber(stats.activeUsers) }}</h2>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="pi pi-users text-green-600 text-xl"></i>
            </div>
          </div>
          <div class="flex items-center text-sm">
            <span class="text-green-600 flex items-center">
              <i class="pi pi-arrow-up mr-1"></i>
              {{ stats.usersChange }}%
            </span>
            <span class="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <!-- Conversion Rate -->
        <div class="bg-white rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-600 text-sm mb-1">Conversion Rate</p>
              <h2 class="text-3xl font-bold text-gray-800">{{ stats.conversionRate }}%</h2>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="pi pi-chart-line text-green-600 text-xl"></i>
            </div>
          </div>
          <div class="flex items-center text-sm">
            <span class="text-green-600 flex items-center">
              <i class="pi pi-arrow-up mr-1"></i>
              {{ stats.conversionChange }}%
            </span>
            <span class="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Revenue Overview -->
        <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Revenue Overview</h3>
          <div class="relative" style="height: 280px;">
            <svg viewBox="0 0 700 280" class="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.5" />
                  <stop offset="100%" stop-color="#dbeafe" stop-opacity="0.1" />
                </linearGradient>
              </defs>

              <!-- Grid lines -->
              <line v-for="val in [0, 1500, 3000, 4500, 6000]" :key="'grid-' + val"
                    x1="50" :y1="240 - (val / 6000) * 200"
                    x2="680" :y2="240 - (val / 6000) * 200"
                    stroke="#f3f4f6" stroke-width="1" />

              <!-- Y-axis labels -->
              <text v-for="val in [0, 1500, 3000, 4500, 6000]" :key="'y-' + val"
                    x="30" :y="244 - (val / 6000) * 200"
                    font-size="12" fill="#9ca3af" text-anchor="end">
                {{ val }}
              </text>

              <!-- X-axis labels -->
              <text v-for="(d, i) in revenueData" :key="'x-' + i"
                    :x="70 + i * 55" y="265"
                    font-size="12" fill="#9ca3af" text-anchor="middle">
                {{ d.month }}
              </text>

              <!-- Area chart -->
              <path :d="revenueAreaPath" fill="url(#gradient)" />

              <!-- Line -->
              <path :d="revenueLinePath" fill="none" stroke="#3b82f6" stroke-width="2.5" />

              <!-- Data points -->
              <circle v-for="(d, i) in revenueData" :key="'point-' + i"
                      :cx="70 + i * 55"
                      :cy="240 - (d.value / 6000) * 200"
                      r="5"
                      fill="#3b82f6"
                      stroke="white"
                      stroke-width="2" />
            </svg>
          </div>
        </div>

        <!-- Profit vs Expenses -->
        <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Profit vs Expenses</h3>
          <div class="relative" style="height: 280px;">
            <svg viewBox="0 0 700 280" class="w-full h-full" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line v-for="val in [0, 2500, 5000, 7500, 10000]" :key="'pgrid-' + val"
                    x1="50" :y1="240 - (val / 10000) * 200"
                    x2="680" :y2="240 - (val / 10000) * 200"
                    stroke="#f3f4f6" stroke-width="1" />

              <!-- Y-axis labels -->
              <text v-for="val in [0, 2500, 5000, 7500, 10000]" :key="'py-' + val"
                    x="30" :y="244 - (val / 10000) * 200"
                    font-size="12" fill="#9ca3af" text-anchor="end">
                {{ val }}
              </text>

              <!-- X-axis labels -->
              <text v-for="(d, i) in profitExpensesData" :key="'px-' + i"
                    :x="70 + i * 55" y="265"
                    font-size="12" fill="#9ca3af" text-anchor="middle">
                {{ d.month }}
              </text>

              <!-- Bars -->
              <g v-for="(d, i) in profitExpensesData" :key="'bar-' + i">
                <!-- Expenses bar (light blue) -->
                <rect
                  :x="70 + i * 55 - 12"
                  :y="240 - (d.expenses / 10000) * 200"
                  width="12"
                  :height="(d.expenses / 10000) * 200"
                  fill="#93c5fd"
                  rx="2" />
                <!-- Profit bar (dark blue) -->
                <rect
                  :x="70 + i * 55 + 1"
                  :y="240 - (d.profit / 10000) * 200"
                  width="12"
                  :height="(d.profit / 10000) * 200"
                  fill="#3b82f6"
                  rx="2" />
              </g>
            </svg>
          </div>
          <div class="flex items-center justify-center mt-4 gap-6 text-sm animate-fadeIn">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-400 rounded mr-2"></div>
              <span class="text-gray-600">expenses</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              <span class="text-gray-600">profit</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Recent Orders -->
        <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Recent Orders</h3>
          <div class="space-y-4">
            <div v-for="order in recentOrders" :key="order.id"
                 class="flex items-center justify-between py-3 border-b last:border-b-0 animate-fadeIn">
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
            <div v-for="product in topProducts" :key="product.id"
                 class="flex items-center justify-between py-3 border-b last:border-b-0 animate-fadeIn">
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
import AdminNav from '../../components/Admin/NavigationBar.vue';
export default {
  name: 'AdminDashboard',
  components: {
    AdminNav,
  },
  data() {
    return {
      stats: {
        totalRevenue: 45231.89,
        revenueChange: 20.1,
        activeUsers: 2350,
        usersChange: 15.3,
        conversionRate: 3.42,
        conversionChange: 8.7
      },
      revenueData: [
        { month: 'Jan', value: 3000 },
        { month: 'Feb', value: 1800 },
        { month: 'Mar', value: 2300 },
        { month: 'Apr', value: 2000 },
        { month: 'May', value: 2800 },
        { month: 'Jun', value: 3200 },
        { month: 'Jul', value: 3800 },
        { month: 'Aug', value: 3500 },
        { month: 'Sep', value: 4000 },
        { month: 'Oct', value: 4300 },
        { month: 'Nov', value: 4700 },
        { month: 'Dec', value: 5500 }
      ],
      profitExpensesData: [
        { month: 'Jan', profit: 1500, expenses: 2000 },
        { month: 'Feb', profit: 9500, expenses: 1500 },
        { month: 'Mar', profit: 800, expenses: 1200 },
        { month: 'Apr', profit: 3500, expenses: 1800 },
        { month: 'May', profit: 5000, expenses: 1600 },
        { month: 'Jun', profit: 3500, expenses: 2200 },
        { month: 'Jul', profit: 4000, expenses: 2000 },
        { month: 'Aug', profit: 5000, expenses: 2500 },
        { month: 'Sep', profit: 4000, expenses: 2300 },
        { month: 'Oct', profit: 5500, expenses: 2800 },
        { month: 'Nov', profit: 6000, expenses: 2600 },
        { month: 'Dec', profit: 7000, expenses: 3000 }
      ],
      recentOrders: [
        { id: 1, customer: 'John Doe', product: 'Comic Book', amount: '29.99', status: 'completed' },
        { id: 2, customer: 'Jane Smith', product: 'Gojo T-Shirt', amount: '69.99', status: 'pending' },
        { id: 3, customer: 'Bob Johnson', product: 'Anime Figures', amount: '138.36', status: 'completed' }
      ],
      topProducts: [
        { id: 1, name: 'Comic Book', sales: 168, revenue: 5038.32, change: 12.5 },
        { id: 2, name: 'Gojo T-Shirt', sales: 150, revenue: 10498.50, change: 8.3 },
        { id: 3, name: 'Anime Figures', sales: 100, revenue: 13836.00, change: -3.2 }
      ]
    };
  },
  computed: {
    revenueLinePath() {
      const points = this.revenueData.map((d, i) => {
        const x = 70 + i * 55;
        const y = 240 - (d.value / 6000) * 200;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      });
      return points.join(' ');
    },
    revenueAreaPath() {
      const linePath = this.revenueData.map((d, i) => {
        const x = 70 + i * 55;
        const y = 240 - (d.value / 6000) * 200;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
      const lastX = 70 + (this.revenueData.length - 1) * 55;
      return `${linePath} L ${lastX},240 L 70,240 Z`;
    }
  },
  methods: {
    formatNumber(num) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    getStatusClass(status) {
      return status === 'completed'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700';
    }
  }
};
</script>

<style scoped>
/* Fade-in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
