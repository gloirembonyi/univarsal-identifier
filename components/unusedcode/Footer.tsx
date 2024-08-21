import styles from '../styles/PlantIdentifier.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div>
            <h3 className={styles.footerTitle}>About Plant Identifier</h3>
            <p>Our AI-powered plant identification tool helps you discover and learn about various plant species quickly and accurately.</p>
          </div>
          <div>
            <h3 className={styles.footerTitle}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>Privacy Policy</a></li>
              <li><a href="#" className={styles.footerLink}>Terms of Service</a></li>
              <li><a href="#" className={styles.footerLink}>FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className={styles.footerTitle}>Contact Us</h3>
            <p>Email: info@plantidentifier.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; 2024 Plant Identifier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}