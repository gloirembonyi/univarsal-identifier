import styles from '../styles/PlantIdentifier.module.css'

interface ResultDisplayProps {
  translatedResult: string | null
  translateResult: (lang: 'en' | 'fr' | 'rw') => void
  loading: boolean
}

export default function ResultDisplay({ translatedResult, translateResult, loading }: ResultDisplayProps) {
  if (!translatedResult) return null

  return (
    <div className={styles.resultDisplay}>
      <div className={styles.translationButtons}>
        {['en', 'fr', 'rw'].map((lang) => (
          <button
            key={lang}
            onClick={() => translateResult(lang as 'en' | 'fr' | 'rw')}
            className={`${styles.translationButton} ${loading ? styles.disabled : ''}`}
            disabled={loading}
          >
            {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Kinyarwanda'}
          </button>
        ))}
      </div>
      <div className={styles.resultGrid}>
        <div className={styles.plantInfo}>
          <h2 className={styles.resultTitle}>Plant Information</h2>
          <p className={styles.resultText}>
            {translatedResult.includes('Plant Information:')
              ? translatedResult.split('Plant Information:')[1].split('Health Assessment:')[0].trim()
              : translatedResult}
          </p>
        </div>
        <div className={styles.healthAssessment}>
          <h2 className={styles.resultTitle}>Health Assessment</h2>
          {translatedResult.includes('Health Assessment:') ? (
            translatedResult.split('Health Assessment:')[1].split('\n').map((line, index) => {
              if (line.startsWith('Status:')) {
                const status = line.split(':')[1].trim();
                return (
                  <p key={index} className={`${styles.statusText} ${status.toLowerCase() === 'good' ? styles.goodStatus : styles.badStatus}`}>
                    {line.trim()}
                  </p>
                );
              } else if (line.trim().startsWith('Appearance:') || 
                        line.trim().startsWith('Maintenance Tips:') || 
                        line.trim().startsWith('Diseases/Issues:') || 
                        line.trim().startsWith('Mitigation:')) {
                const [label, ...content] = line.split(':');
                return (
                  <div key={index} className={styles.assessmentItem}>
                    <p className={styles.assessmentLabel}>{label.trim()}:</p>
                    <p className={styles.assessmentContent}>{content.join(':').trim()}</p>
                  </div>
                );
              } else if (line.trim()) {
                return <p key={index} className={styles.assessmentText}>{line.trim()}</p>;
              }
              return null;
            })
          ) : (
            <p className={styles.noAssessment}>No health assessment available.</p>
          )}
        </div>
      </div>
    </div>
  )
}