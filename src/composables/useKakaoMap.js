import { ref } from 'vue'

const isLoaded = ref(false)
let mapPromise = null

export const useKakaoMap = () => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY

    const loadKakaoMap = () => {
        if (isLoaded.value && window.kakao && window.kakao.maps) {
            return Promise.resolve(window.kakao)
        }

        if (!mapPromise) {
            mapPromise = new Promise((resolve, reject) => {
                if (window.kakao && window.kakao.maps) {
                    isLoaded.value = true
                    resolve(window.kakao)
                    return
                }

                const script = document.createElement('script')
                script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services,clusterer,drawing`
                script.onload = () => {
                    window.kakao.maps.load(() => {
                        isLoaded.value = true
                        resolve(window.kakao)
                    })
                }
                script.onerror = (err) => {
                    mapPromise = null // Reset on failure
                    reject(err)
                }
                document.head.appendChild(script)
            })
        }

        return mapPromise
    }

    return {
        loadKakaoMap,
        isLoaded
    }
}
