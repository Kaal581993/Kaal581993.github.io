import { profileDescription, serviceMarkets, skillCategories } from './profileContent'
import './professional-profile.css'

export const ProfessionalProfile = () => (
  <section className="professional-profile" aria-labelledby="professional-profile-title">
    <header className="professional-profile-heading">
      <span className="professional-profile-index">02 / CAPABILITIES</span>
      <h2 id="professional-profile-title">Freelance Java Developer & Application Support</h2>
      <p>{profileDescription}</p>
    </header>

    <div className="professional-skill-grid">
      {skillCategories.map((category) => (
        <section className="professional-skill-group" key={category.name} aria-labelledby={`skill-${category.name.replaceAll(/[^a-z0-9]+/gi, '-')}`}>
          <h3 id={`skill-${category.name.replaceAll(/[^a-z0-9]+/gi, '-')}`}>{category.name}</h3>
          <p>{category.skills.join(' · ')}</p>
        </section>
      ))}
    </div>

    <footer className="professional-markets">
      <h3>Remote freelance projects</h3>
      <p>Available to collaborate remotely with teams and clients in:</p>
      <ul aria-label="Remote service regions">
        {serviceMarkets.map((market) => <li key={market}>{market}</li>)}
      </ul>
    </footer>
  </section>
)
