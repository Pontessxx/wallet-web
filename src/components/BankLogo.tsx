interface BankLogoProps {
  nome: string
  color?: string
  size?: number
}

const BankLogo = ({
  nome,
  color = '#4B5563',
  size = 32,
}: BankLogoProps) => {
  const inicial = nome.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.45,
        flexShrink: 0,
      }}
    >
      {inicial}
    </div>
  )
}

export default BankLogo
