// Mock User API
export default {
    getProfile() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        id: 1,
                        name: '김러너',
                        email: 'runner@crewup.com',
                        image: 'https://picsum.photos/seed/user1/200/200',
                        joinDate: '2024-01-01',
                        introduction: '안녕하세요! 매일 아침 러닝을 즐기는 김러너입니다. 함께 달려요!',
                        stats: {
                            totalDistance: 152.5,
                            totalRuns: 24,
                            avgPace: '5:30'
                        }
                    }
                })
            }, 500)
        })
    },

    updateProfile(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Updating profile:', data)
                resolve({ success: true })
            }, 1000)
        })
    }
}
