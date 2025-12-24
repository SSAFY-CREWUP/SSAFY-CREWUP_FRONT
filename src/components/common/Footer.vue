<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>CrewUp</h3>
          <p>러너들을 위한 스마트한 크루 관리 플랫폼</p>
        </div>
        
        <div class="footer-links">
          <a href="#">서비스 소개</a>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">고객센터</a>
        </div>

        <div class="footer-social">
          <a href="https://github.com/SSAFY-CREWUP/SSAFY-CREWUP-SERVER" target="_blank" class="social-icon">
            Github
          </a>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 CrewUp. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #111827; /* Dark Background */
  color: #F9FAFB; /* Light Text */
  padding: 80px 0 40px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  border-top: 1px solid #1F2937;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 60px;
}

.footer-brand h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #818cf8, #c084fc);
  background-clip: text; /* Standard Property */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-brand p {
  color: #9CA3AF;
  font-size: 0.95rem;
  font-weight: 500;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: #D1D5DB;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: #818cf8; /* Light Indigo */
}

.footer-social {
  display: flex;
  gap: 12px;
}

.social-icon {
  color: #D1D5DB;
  text-decoration: none;
  font-size: 0.9rem;
  border: 1px solid #374151;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s;
  background: #1F2937;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.social-icon:hover {
  background: #374151;
  color: white;
  border-color: #4B5563;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.footer-bottom {
  border-top: 1px solid #1F2937;
  padding-top: 30px;
  text-align: center;
  color: #6B7280;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
