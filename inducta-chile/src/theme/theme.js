import { extendTheme } from '@chakra-ui/react'
import { theme as saasTheme } from '@saas-ui/react'

// Colores y tipografia de Inducta sobre el tema base de Saas UI
const colors = {
  brand: {
    soft: '#FAFAFA',
    ink: '#0D0D0D',
    wash: '#EEF0FC',
    primary: '#1B22A7',
    primaryDark: '#151A85',
    accent: '#4260E6',
    accentDark: '#3550C4',
  },
}

export const theme = extendTheme(
  {
    colors,
    fonts: {
      heading: `'Inter', 'Segoe UI', sans-serif`,
      body: `'Inter', 'Segoe UI', sans-serif`,
    },
    styles: {
      global: {
        body: {
          bg: 'white',
          color: 'brand.ink',
        },
      },
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: 'semibold',
          borderRadius: 'md',
        },
        variants: {
          solid: {
            bg: 'brand.primary',
            color: 'white',
            _hover: { bg: 'brand.primaryDark' },
          },
          outline: {
            borderColor: 'blackAlpha.200',
            color: 'brand.ink',
            bg: 'white',
            _hover: { bg: 'brand.soft' },
          },
          ghost: {
            color: 'brand.ink',
            _hover: { bg: 'blackAlpha.50' },
          },
        },
        defaultProps: {
          variant: 'solid',
          colorScheme: 'blue',
        },
      },
      Heading: {
        baseStyle: {
          color: 'brand.ink',
          letterSpacing: '-0.03em',
        },
      },
      Link: {
        baseStyle: {
          color: 'brand.ink',
          _hover: { color: 'brand.primary', textDecoration: 'none' },
        },
      },
    },
  },
  saasTheme,
)
