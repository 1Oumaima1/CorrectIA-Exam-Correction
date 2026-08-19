// UI.jsx
import { createPortal } from 'react-dom'

// ===== BUTTON =====
export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  onClick,
  type = 'button',
  style,
  disabled,
}) {
  const styles = {
    primary: {
      background: '#2563eb',
      color: '#ffffff',
      border: '1px solid #2563eb',
    },

    danger: {
      background: '#dc2626',
      color: '#ffffff',
      border: '1px solid #dc2626',
    },

    ghost: {
      background: '#ffffff',
      color: '#475467',
      border: '1px solid #d9dee7',
    },

    success: {
      background: '#16a34a',
      color: '#ffffff',
      border: '1px solid #16a34a',
    },
  }

  const sizes = {
    sm: {
      padding: '7px 13px',
      fontSize: '13px',
      borderRadius: '8px',
    },

    md: {
      padding: '10px 17px',
      fontSize: '14px',
      borderRadius: '9px',
    },

    lg: {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '10px',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        ...styles[variant],
        ...sizes[size],
        fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.7 : 1,
        transition: 'all .15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        outline: 'none',
        ...style,
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}


// ===== SPINNER =====
export function Spinner({
  size = 20,
  color = '#2563eb',
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}


// ===== CARD =====
export function Card({
  children,
  style,
  className,
}) {
  return (
    <div
      className={className}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e9f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}


// ===== STAT CARD =====
export function StatCard({
  label,
  value,
  color = '#2563eb',
}) {
  return (
    <Card
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '105px',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: color,
            lineHeight: 1,
            marginBottom: '9px',
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: '#667085',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          width: '8px',
          height: '42px',
          borderRadius: '5px',
          background: color,
          opacity: 0.85,
        }}
      />
    </Card>
  )
}


// ===== INPUT =====
export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  name,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '13px',
            color: '#344054',
            fontWeight: 600,
          }}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        style={{
          background: '#ffffff',
          border: '1px solid #d9dee7',
          borderRadius: '8px',
          padding: '10px 13px',
          color: '#172033',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#2563eb'
          e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = '#d9dee7'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}


// ===== SELECT =====
export function Select({
  label,
  value,
  onChange,
  children,
  required,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '13px',
            color: '#344054',
            fontWeight: 600,
          }}
        >
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          background: '#ffffff',
          border: '1px solid #d9dee7',
          borderRadius: '8px',
          padding: '10px 13px',
          color: '#172033',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          cursor: 'pointer',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#2563eb'
          e.target.style.boxShadow =
            '0 0 0 3px rgba(37, 99, 235, 0.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = '#d9dee7'
          e.target.style.boxShadow = 'none'
        }}
      >
        {children}
      </select>
    </div>
  )
}




// ===== MODAL =====
export function Modal({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,

        
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '20px',
        boxSizing: 'border-box',

        overflowY: 'auto',

        zIndex: 99999,

        animation: 'fadeIn .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          color: '#111827',

          border: '1px solid #e5e9f0',
          borderRadius: '14px',

          width: '100%',
          maxWidth: '650px',

          maxHeight: 'calc(100vh - 40px)',

          boxSizing: 'border-box',

          padding: '28px',

      
          overflowY: 'auto',

          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',

          flexShrink: 0,

          animation: 'fadeUp .25s ease',
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',

            position: 'sticky',
            top: 0,
            background: '#ffffff',
            zIndex: 2,

            paddingBottom: '4px',
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#111827',
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',

              background: '#f8fafc',
              border: '1px solid #e5e9f0',
              borderRadius: '8px',

              color: '#64748b',
              fontSize: '20px',
              lineHeight: 1,

              cursor: 'pointer',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* FORMULAIRE */}
        <div>
          {children}
        </div>

      </div>
    </div>,

    document.body
  )
}

// ===== BADGE =====
export function Badge({
  children,
  color = '#2563eb',
}) {
  return (
    <span
      style={{
        background: `${color}12`,
        color: color,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  )
}


// ===== ALERT =====
export function Alert({
  type = 'error',
  message,
}) {
  if (!message) return null

  const colors = {
    error: '#dc2626',
    success: '#16a34a',
    info: '#2563eb',
  }

  const backgrounds = {
    error: '#fef2f2',
    success: '#f0fdf4',
    info: '#eff6ff',
  }

  const borders = {
    error: '#fecaca',
    success: '#bbf7d0',
    info: '#bfdbfe',
  }

  const color = colors[type] || colors.error
  const background = backgrounds[type] || backgrounds.error
  const border = borders[type] || borders.error

  return (
    <div
      style={{
        background: background,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        color: color,
        fontSize: '13px',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  )
}


// ===== TABLE =====
export function Table({
  headers,
  rows,
  emptyMsg = 'Aucune donnée',
}) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid #e5e9f0',
        borderRadius: '10px',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
          background: '#ffffff',
        }}
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  color: '#667085',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#f8fafc',
                  borderBottom: '1px solid #e5e9f0',
                  whiteSpace: 'nowrap',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{
                  padding: '32px 14px',
                  color: '#98a2b3',
                  textAlign: 'center',
                  background: '#ffffff',
                }}
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom:
                    rowIndex === rows.length - 1
                      ? 'none'
                      : '1px solid #eef1f5',
                  background: '#ffffff',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff'
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      padding: '13px 14px',
                      color: '#344054',
                      verticalAlign: 'middle',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}