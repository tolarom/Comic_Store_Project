<template>
  <Header/>
  <div class="p-6 bg-gray-100 min-h-screen">

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
        <div class="relative h-64">
          <svg viewBox="0 0 600 250" class="w-full h-full">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#93c5fd" stop-opacity="0.1" />
              </linearGradient>
            </defs>

            <!-- Y-axis labels -->
            <text v-for="val in [0, 1500, 3000, 4500, 6000]" :key="'y-' + val"
                  x="20" :y="210 - (val / maxRevenue) * 180"
                  font-size="10" fill="#9ca3af">
              {{ val }}
            </text>

            <!-- X-axis labels -->
            <text v-for="(d, i) in revenueData" :key="'x-' + i"
                  :x="60 + i * 45" y="235"
                  font-size="10" fill="#9ca3af" text-anchor="middle">
              {{ d.month }}
            </text>

            <!-- Area chart -->
            <path :d="revenueAreaPath" fill="url(#gradient)" class="animate-fadeIn" />

            <!-- Line -->
            <path :d="revenueLinePath" fill="none" stroke="#3b82f6" stroke-width="2"
                  class="stroke-dasharray animate-draw" />
          </svg>
        </div>
      </div>

      <!-- Profit vs Expenses -->
      <div class="bg-white rounded-lg p-6 shadow-sm animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Profit vs Expenses</h3>
        <div class="relative h-64">
          <svg viewBox="0 0 600 250" class="w-full h-full">
            <!-- Y-axis labels -->
            <text v-for="val in [0, 2500, 5000, 7500, 10000]" :key="'py-' + val"
                  x="20" :y="210 - (val / 10000) * 180"
                  font-size="10" fill="#9ca3af">
              {{ val }}
            </text>

            <!-- X-axis labels -->
            <text v-for="(d, i) in profitExpensesData" :key="'px-' + i"
                  :x="60 + i * 45" y="235"
                  font-size="10" fill="#9ca3af" text-anchor="middle">
              {{ d.month }}
            </text>

            <!-- Bars -->
            <g v-for="(d, i) in profitExpensesData" :key="'bar-' + i">
              <rect
                :x="60 + i * 45 - 8"
                :y="210 - (d.expenses / 10000) * 180"
                width="8"
                :height="(d.expenses / 10000) * 180"
                fill="#6b7280"
                class="transform transition duration-700 hover:scale-y-105"
              />
              <rect
                :x="60 + i * 45 + 2"
                :y="210 - (d.profit / 10000) * 180"
                width="8"
                :height="(d.profit / 10000) * 180"
                fill="#3b82f6"
                class="transform transition duration-700 hover:scale-y-105"
              />
            </g>
          </svg>
        </div>
        <div class="flex items-center justify-center mt-4 gap-6 text-sm animate-fadeIn">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-gray-600 rounded mr-2"></div>
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
               class="flex items-center justify-between py-3 border-b last:border-b-0 transform transition duration-500 hover:translate-x-2 hover:bg-gray-50 animate-fadeIn">
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
               class="flex items-center justify-between py-3 border-b last:border-b-0 transform transition duration-500 hover:-translate-x-2 hover:bg-gray-50 animate-fadeIn">
            <div>
              <p class="font-medium text-gray-800">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ product.sales }} sales</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-800">${{ formatNumber(product.revenue) }}</p>
              <span :class="product.change >= 0 ? 'text-green-600' : 'text-red-600'"
                    class="text-xs flex items-center justify-end">
                <i :class="product.change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="mr-1 text-xs"></i>
                {{ Math.abs(product.change) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import Header from '../../components/Admin/NavigationBar.vue';
export default {
  name: 'Dashboard',
  components: {
    Header,
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
        { month: 'Jan', value: 4500 },
        { month: 'Feb', value: 3000 },
        { month: 'Mar', value: 3500 },
        { month: 'Apr', value: 2800 },
        { month: 'May', value: 4200 },
        { month: 'Jun', value: 3800 },
        { month: 'Jul', value: 4500 },
        { month: 'Aug', value: 4800 },
        { month: 'Sep', value: 5200 },
        { month: 'Oct', value: 5500 },
        { month: 'Nov', value: 5800 },
        { month: 'Dec', value: 6000 }
      ],
      profitExpensesData: [
        { month: 'Jan', profit: 2500, expenses: 2000 },
        { month: 'Feb', profit: 1800, expenses: 1200 },
        { month: 'Mar', profit: 2200, expenses: 1500 },
        { month: 'Apr', profit: 9500, expenses: 1800 },
        { month: 'May', profit: 3500, expenses: 2200 },
        { month: 'Jun', profit: 4500, expenses: 2500 },
        { month: 'Jul', profit: 3800, expenses: 2000 },
        { month: 'Aug', profit: 4000, expenses: 2300 },
        { month: 'Sep', profit: 5200, expenses: 2800 },
        { month: 'Oct', profit: 3500, expenses: 2100 },
        { month: 'Nov', profit: 5500, expenses: 3000 },
        { month: 'Dec', profit: 7000, expenses: 3500 }
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
    maxRevenue() {
      return Math.max(...this.revenueData.map(d => d.value));
    },
    revenueLinePath() {
      const points = this.revenueData.map((d, i) => {
        const x = 60 + i * 45;
        const y = 210 - (d.value / this.maxRevenue) * 180;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      });
      return points.join(' ');
    },
    revenueAreaPath() {
      const linePath = this.revenueData.map((d, i) => {
        const x = 60 + i * 45;
        const y = 210 - (d.value / this.maxRevenue) * 180;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
      const lastX = 60 + (this.revenueData.length - 1) * 45;
      return `${linePath} L ${lastX},210 L 60,210 Z`;
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

/* Line chart draw animation */
@keyframes draw {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}
.stroke-dasharray {
  stroke-dasharray: 1000;
  animation: draw 1s ease forwards;
}

svg {
  width: 100%;
  height: auto;
  max-width: 100%;
}

</style>
