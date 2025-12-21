import { ref } from 'vue'

const isLoaded = ref(false)
const isLoading = ref(false)

export const useKakaoMap = () => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY

    const loadKakaoMap = () => {
        return new Promise((resolve, reject) => {
            if (window.kakao && window.kakao.maps) {
                isLoaded.value = true
                resolve(window.kakao)
                return
            }

            if (isLoading.value) {
                // Wait for existing load to finish
                const checkInterval = setInterval(() => {
                    if (window.kakao && window.kakao.maps) {
                        clearInterval(checkInterval)
                        isLoaded.value = true
                        resolve(window.kakao)
                    }
                }, 100)
                return
            }

            isLoading.value = true

            const script = document.createElement('script')
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services,clusterer,drawing`
            script.onload = () => {
                window.kakao.maps.load(() => {
                    isLoading.value = false
                    isLoaded.value = true
                    resolve(window.kakao)
                })
            }
            script.onerror = (err) => {
                isLoading.value = false
                reject(err)
            }
            document.head.appendChild(script)
        })
    }

    return {
        loadKakaoMap,
        isLoaded
    }
}
