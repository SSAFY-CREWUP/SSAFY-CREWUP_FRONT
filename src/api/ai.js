// Mock AI Recommendation API

export default {
    recommendCrews(preferences) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock Logic: Return 3 random crews with generated match rates
                const mockCrews = [
                    {
                        id: 1,
                        name: '한강 러너스',
                        location: '서울 여의도',
                        pace: '5:30',
                        members: 120,
                        image: 'https://picsum.photos/seed/1/300/200',
                        matchRate: 98,
                        reason: '활동 시간대가 완벽하게 일치하고, 목표하신 페이스와 크루의 평균 페이스가 매우 비슷합니다. 친목 중심의 분위기도 잘 맞을 것 같아요!'
                    },
                    {
                        id: 2,
                        name: '남산 거북이',
                        location: '서울 남산',
                        pace: '6:00',
                        members: 85,
                        image: 'https://picsum.photos/seed/2/300/200',
                        matchRate: 85,
                        reason: '위치가 가깝고 초보자 환영 분위기라 부담 없이 시작하기 좋습니다. 다만 페이스가 조금 빠를 수 있어요.'
                    },
                    {
                        id: 3,
                        name: '강남 스프린터',
                        location: '서울 강남',
                        pace: '4:30',
                        members: 200,
                        image: 'https://picsum.photos/seed/3/300/200',
                        matchRate: 78,
                        reason: '대회 준비를 위한 체계적인 훈련 프로그램이 강점입니다. 실력 향상을 원하신다면 최고의 선택이 될 거예요.'
                    }
                ]
                resolve({ data: mockCrews })
            }, 3000) // 3 seconds delay for "AI Analysis" effect
        })
    },

    predictDifficulty(stats) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock Logic based on stats
                let difficulty = 'NORMAL'
                let confidence = 0.85 + Math.random() * 0.1

                if (stats.elevationGain > 100 || stats.maxGradient > 10) {
                    difficulty = 'HARD'
                    confidence = 0.92
                } else if (stats.distance < 3 && stats.elevationGain < 20) {
                    difficulty = 'EASY'
                    confidence = 0.88
                }

                resolve({
                    data: {
                        difficulty,
                        confidence: parseFloat(confidence.toFixed(2))
                    }
                })
            }, 1000)
        })
    }
}
