import { useState } from 'react'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  minLength?: number
  autoComplete?: string
  placeholder?: string
}

export function PasswordField({
  label,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  placeholder,
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <label>
      {label}
      <span className="pw-field">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          className="pw-toggle"
          type="button"
          aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
          onClick={() => setShow((cur) => !cur)}
        >
          {show ? (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3.3 2.5 2 3.8l3.1 3.1C3.4 8.3 2.2 9.9 1.5 12c1.7 5 6.2 8 10.5 8 2 0 4-.6 5.7-1.8l3.3 3.3 1.3-1.3zm8.7 14c-3.4 0-6.4-2-8.2-5 .7-1.2 1.7-2.3 2.9-3.1l1.8 1.8A4 4 0 0 0 12 16a4 4 0 0 0 2.5-.9l1.5 1.5c-1.1.6-2.5.9-3.8.9m8.5-1.2-2.1-2.1c.5-.7.8-1.5.8-2.2a4 4 0 0 0-4-4c-.8 0-1.5.2-2.2.7L11.4 6C11.6 6 11.8 6 12 6c4.3 0 8.8 3 10.5 8-.5 1.4-1.3 2.6-2.3 3.6"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 6c4.3 0 8.8 3 10.5 8-1.7 5-6.2 8-10.5 8S3.2 19 1.5 14C3.2 9 7.7 6 12 6m0 2c-3.4 0-6.4 2-8.2 5 1.8 3 4.8 5 8.2 5s6.4-2 8.2-5c-1.8-3-4.8-5-8.2-5m0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6"
              />
            </svg>
          )}
        </button>
      </span>
    </label>
  )
}
