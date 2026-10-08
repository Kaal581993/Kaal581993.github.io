import { Modal } from '../../components/Modal'
import { services } from './services'
import './services-catalog.css'

interface ServicesCatalogProps {
  onClose: () => void
}

export const ServicesCatalog = ({ onClose }: ServicesCatalogProps) => (
  <Modal title="Services & estimates" eyebrow="PROJECT MENU / INR" onClose={onClose}>
    <div className="services-catalog">
      <p className="services-intro">Indicative project budgets. Final quotes depend on scope, integrations, and delivery requirements.</p>
      <div className="service-list">
        {services.map((service, index) => (
          <article className="service-item" key={service.name}>
            <span className="service-index">0{index + 1}</span>
            <div className="service-description"><h3>{service.name}</h3><p>{service.summary}</p></div>
            <strong className="service-estimate">{service.estimate}</strong>
          </article>
        ))}
      </div>
      <p className="services-footnote">These are editable estimates, not binding quotes. Send a brief with the <code>contact</code> command for a tailored proposal.</p>
    </div>
  </Modal>
)
