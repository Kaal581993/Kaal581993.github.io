import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import './contact-form.css'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

interface ContactFormProps {
  onClose: () => void
}

export const ContactForm = ({ onClose }: ContactFormProps) => {
  const [candidateEmail, setCandidateEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<SendState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('sending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateEmail, subject, message, website }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Message delivery failed.')
      setState('sent')
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Message could not be sent. Please try again later.')
    }
  }

  return (
    <Modal title="Compose a message" eyebrow="DIRECT SMTP / TO VIRAL" onClose={onClose}>
      {state === 'sent' ? (
        <section className="contact-result" role="status">
          <span className="contact-result-mark" aria-hidden="true">[ OK ]</span>
          <h3>Message sent</h3>
          <p>Your message was delivered to Viral. A reply can go directly to {candidateEmail}.</p>
          <button className="contact-submit" type="button" onClick={onClose}>CLOSE COMPOSER</button>
        </section>
      ) : (
        <form className="contact-form" onSubmit={submit}>
          <p className="contact-recipient">TO <strong>viral.prajapati.nmims@gmail.com</strong><span>SMTP / PRIVATE SERVER CONNECTION</span></p>
          <label>YOUR EMAIL
            <input type="email" value={candidateEmail} onChange={(event) => setCandidateEmail(event.target.value)} required maxLength={254} autoComplete="email" placeholder="name@example.com" />
          </label>
          <label>SUBJECT
            <input type="text" value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={160} placeholder="What would you like to discuss?" />
          </label>
          <label>MESSAGE
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength={10} maxLength={8000} rows={6} placeholder="Write your message..." />
            <span className="contact-character-count">{message.length} / 8000</span>
          </label>
          <label className="contact-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
          {state === 'error' && <p className="contact-error" role="alert">{errorMessage}</p>}
          <div className="contact-actions">
            <span>YOUR ADDRESS IS USED ONLY FOR A REPLY.</span>
            <button className="contact-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'SENDING…' : 'SEND MESSAGE ↗'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
