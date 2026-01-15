<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center text-sm text-gray-600 mb-2">
          <i class="pi pi-home"></i>
          <span class="mx-2">/</span>
          <span>Dashboard</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-1">Detailed analytics and insights for your business performance.</p>
      </div>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          v-for="(metric, key) in dashboardData.metrics"
          :key="key"
          :title="metric.title"
          :value="metric.value"
          :change="metric.change"
          :trend="metric.trend"
          :icon="metric.icon"
        />
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- User Growth Chart -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">User Growth</h3>
          <div style="height: 300px; position: relative;">
            <canvas ref="userGrowthChart"></canvas>
          </div>
        </div>

        <!-- Page Views Chart -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Page Views (Last 7 Days)</h3>
          <div style="height: 300px; position: relative;">
            <canvas ref="pageViewsChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Traffic Sources -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Traffic Sources</h3>
          <div class="flex items-center justify-between">
            <div style="width: 200px; height: 200px; position: relative;">
              <canvas ref="trafficSourcesChart"></canvas>
            </div>
            <div class="flex-1 pl-8">
              <div
                v-for="(source, index) in dashboardData.trafficSources"
                :key="index"
                class="flex items-center justify-between mb-3"
              >
                <div class="flex items-center">
                  <div
                    class="w-3 h-3 rounded-full mr-2"
                    :style="{ backgroundColor: source.color }"
                  ></div>
                  <span class="text-sm text-gray-700">{{ source.name }}</span>
                </div>
                <span class="text-sm font-semibold">{{ source.value.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Funnel -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Conversion Funnel</h3>
          <div class="space-y-4">
            <div v-for="(stage, index) in dashboardData.conversionFunnel" :key="index">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700">{{ stage.stage }}</span>
                <span class="text-sm font-semibold">{{ stage.value }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${stage.value}%`, backgroundColor: stage.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Device Analytics -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Device Analytics</h3>
          <div class="space-y-4">
            <div
              v-for="(device, index) in dashboardData.deviceAnalytics"
              :key="index"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <i :class="device.icon" class="text-blue-600 text-xl"></i>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ device.device }}</div>
                  <div class="text-sm text-gray-500">{{ device.users.toLocaleString() }} users</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-gray-900">{{ calculatePercentage(device.users) }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Performing Pages -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Top Performing Pages</h3>
          <div class="space-y-3">
            <div
              v-for="(page, index) in dashboardData.topPages"
              :key="index"
              class="flex items-center text-sm border-b border-gray-100 pb-3 last:border-0"
            >
              <div class="w-8 font-semibold text-gray-500">#{{ page.rank }}</div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ page.url }}</div>
                <div class="text-gray-500 flex items-center space-x-3 mt-1">
                  <span>{{ page.views }} views</span>
                  <span>•</span>
                  <span>{{ page.avgTime }} avg</span>
                  <span>•</span>
                  <span>{{ page.bounce }} bounce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, defineComponent } from 'vue';
import Chart from 'chart.js/auto';

// MetricCard Component
const MetricCard = defineComponent({
  name: 'MetricCard',
  props: {
    title: String,
    value: [String, Number],
    change: Number,
    trend: String,
    icon: String
  },
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex justify-between items-start mb-4">
        <div class="text-sm text-gray-600">{{ title }}</div>
        <i :class="icon" class="text-green-500 text-3xl"></i>
      </div>
      <div class="text-3xl font-bold mb-2">{{ value }}</div>
      <div :class="['text-sm flex items-center', trend === 'up' ? 'text-green-600' : 'text-red-600']">
        <i :class="trend === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="mr-1"></i>
        {{ trend === 'up' ? '↑' : '↓' }} {{ Math.abs(change) }}% vs last month
      </div>
    </div>
  `
});

export default {
  name: 'AnalyticsDashboard',
  components: {
    MetricCard
  },
  setup() {
    const userGrowthChart = ref(null);
    const pageViewsChart = ref(null);
    const trafficSourcesChart = ref(null);

    let userGrowthChartInstance = null;
    let pageViewsChartInstance = null;
    let trafficSourcesChartInstance = null;

    const dashboardData = ref({
      metrics: {
        totalUsers: { title: 'Total Users', value: 282, change: 18.86, trend: 'up', icon: 'pi pi-users' },
        pageViews: { title: 'Page Views', value: 482, change: 12, trend: 'up', icon: 'pi pi-eye' },
        avgSession: { title: 'Avg Session', value: 2.34, change: -12, trend: 'down', icon: 'pi pi-clock' },
        bounceRate: { title: 'Bounce Rate', value: 3, change: -18, trend: 'down', icon: 'pi pi-chart-line' }
      },
      userGrowth: [
        { month: 'M1', newUsers: 45, returningUsers: 30 },
        { month: 'M2', newUsers: 52, returningUsers: 35 },
        { month: 'M3', newUsers: 58, returningUsers: 42 },
        { month: 'M4', newUsers: 65, returningUsers: 48 },
        { month: 'M5', newUsers: 72, returningUsers: 55 },
        { month: 'M6', newUsers: 78, returningUsers: 60 }
      ],
      pageViews: [
        { day: 'M1', totalViews: 85, uniqueVisitors: 65 },
        { day: 'M2', totalViews: 95, uniqueVisitors: 72 },
        { day: 'M3', totalViews: 88, uniqueVisitors: 68 },
        { day: 'M4', totalViews: 105, uniqueVisitors: 82 },
        { day: 'M5', totalViews: 128, uniqueVisitors: 95 },
        { day: 'M6', totalViews: 98, uniqueVisitors: 75 },
        { day: 'M7', totalViews: 92, uniqueVisitors: 70 }
      ],
      trafficSources: [
        { name: 'Direct', value: 4500, color: '#3b82f6' },
        { name: 'Organic Search', value: 3200, color: '#10b981' },
        { name: 'Social', value: 2700, color: '#8b5cf6' },
        { name: 'Referral', value: 1900, color: '#f59e0b' },
        { name: 'Email', value: 1200, color: '#ef4444' }
      ],
      conversionFunnel: [
        { stage: 'Visits', value: 100, color: '#3b82f6' },
        { stage: 'Product Views', value: 75, color: '#10b981' },
        { stage: 'Add to Cart', value: 45, color: '#f59e0b' },
        { stage: 'Checkout', value: 25, color: '#ef4444' },
        { stage: 'Purchase', value: 15, color: '#8b5cf6' }
      ],
      deviceAnalytics: [
        { device: 'Desktop', users: 12300, icon: 'pi pi-desktop' },
        { device: 'Mobile', users: 15800, icon: 'pi pi-mobile' },
        { device: 'Tablet', users: 3200, icon: 'pi pi-tablet' }
      ],
      topPages: [
        { rank: 1, url: '/products/wireless-headphones', views: '8,234', avgTime: '3:29', bounce: '34%' },
        { rank: 2, url: '/products/smart-watch', views: '6,892', avgTime: '4:12', bounce: '28%' },
        { rank: 3, url: '/products/laptop-stand', views: '5,641', avgTime: '2:56', bounce: '42%' },
        { rank: 4, url: '/blog/tech-trends-2024', views: '5,234', avgTime: '5:43', bounce: '23%' },
        { rank: 5, url: '/products/usb-c-hub', views: '4,892', avgTime: '3:08', bounce: '38%' }
      ]
    });

    const calculatePercentage = (users) => {
      const total = dashboardData.value.deviceAnalytics.reduce((sum, d) => sum + d.users, 0);
      return ((users / total) * 100).toFixed(1);
    };

    const initializeCharts = () => {
      // Destroy existing charts to prevent duplicates
      if (userGrowthChartInstance) userGrowthChartInstance.destroy();
      if (pageViewsChartInstance) pageViewsChartInstance.destroy();
      if (trafficSourcesChartInstance) trafficSourcesChartInstance.destroy();

      // User Growth Chart
      if (userGrowthChart.value) {
        userGrowthChartInstance = new Chart(userGrowthChart.value, {
          type: 'line',
          data: {
            labels: dashboardData.value.userGrowth.map(d => d.month),
            datasets: [
              {
                label: 'New Users',
                data: dashboardData.value.userGrowth.map(d => d.newUsers),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Returning Users',
                data: dashboardData.value.userGrowth.map(d => d.returningUsers),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
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
                beginAtZero: true
              }
            }
          }
        });
      }

      // Page Views Chart
      if (pageViewsChart.value) {
        pageViewsChartInstance = new Chart(pageViewsChart.value, {
          type: 'bar',
          data: {
            labels: dashboardData.value.pageViews.map(d => d.day),
            datasets: [
              {
                label: 'Total Views',
                data: dashboardData.value.pageViews.map(d => d.totalViews),
                backgroundColor: '#3b82f6'
              },
              {
                label: 'Unique Visitors',
                data: dashboardData.value.pageViews.map(d => d.uniqueVisitors),
                backgroundColor: '#10b981'
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
                beginAtZero: true
              }
            }
          }
        });
      }

      // Traffic Sources Chart
      if (trafficSourcesChart.value) {
        trafficSourcesChartInstance = new Chart(trafficSourcesChart.value, {
          type: 'doughnut',
          data: {
            labels: dashboardData.value.trafficSources.map(d => d.name),
            datasets: [
              {
                data: dashboardData.value.trafficSources.map(d => d.value),
                backgroundColor: dashboardData.value.trafficSources.map(d => d.color)
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    };

    const fetchAnalyticsData = async () => {
      try {
        // Example API call - replace with your actual endpoint
        // const response = await fetch('/api/analytics/dashboard');
        // const data = await response.json();
        // dashboardData.value = data;
        //
        // After fetching new data, reinitialize charts
        // initializeCharts();
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    onMounted(() => {
      // Wait for next tick to ensure canvas elements are rendered
      setTimeout(() => {
        initializeCharts();
      }, 100);

      // Uncomment to fetch data on mount
      // fetchAnalyticsData();
    });

    onBeforeUnmount(() => {
      // Clean up chart instances
      if (userGrowthChartInstance) userGrowthChartInstance.destroy();
      if (pageViewsChartInstance) pageViewsChartInstance.destroy();
      if (trafficSourcesChartInstance) trafficSourcesChartInstance.destroy();
    });

    return {
      userGrowthChart,
      pageViewsChart,
      trafficSourcesChart,
      dashboardData,
      calculatePercentage,
      fetchAnalyticsData
    };
  }
};
</script>

<style scoped>
/* Ensure charts don't overflow */
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
