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
          <a href="#" class="social-icon">Instagram</a>
          <a href="#" class="social-icon">Facebook</a>
          <a href="#" class="social-icon">Twitter</a>
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
  background-color: #2c3e50;
  color: white;
  padding: 60px 0 30px;
  font-family: 'Noto Sans KR', sans-serif;
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
  margin-bottom: 40px;
}

.footer-brand h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.footer-brand p {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #ecf0f1;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--color-running-green);
}

.footer-social {
  display: flex;
  gap: 15px;
}

.social-icon {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  border: 1px solid #bdc3c7;
  padding: 5px 15px;
  border-radius: 20px;
  transition: all 0.3s;
}

.social-icon:hover {
  background: white;
  color: #2c3e50;
  border-color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
