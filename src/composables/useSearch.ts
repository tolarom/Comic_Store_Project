import { ref } from 'vue'

const searchQuery = ref<string>('')

export function useSearch() {
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearSearchQuery = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
  }
}
