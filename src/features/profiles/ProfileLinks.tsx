import { profileLinks } from './profileLinks'
import './profile-links.css'

export const ProfileLinks = () => (
  <section className="profile-links" aria-label="Coding profile links">
    {profileLinks.map((profile) => (
      <a className="profile-link" href={profile.url} target="_blank" rel="noreferrer" key={profile.label}>
          <span className="profile-link-copy">
            <strong>{profile.label}</strong>
            <small>{profile.details}</small>
            <small className="profile-updated">{profile.updated}</small>
          </span>
          <span className="profile-link-arrow" aria-hidden="true">↗</span>
      </a>
    ))}
  </section>
)
