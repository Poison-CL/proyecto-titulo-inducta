import { extendTheme } from '@chakra-ui/react'
import { theme as saasTheme } from '@saas-ui/react'

// Colores y tipografia de Inducta sobre el tema base de Saas UI
const colors = {
  brand: {
    soft: '#F0F5F9',
    ink: '#2B2E4A',
    primary: '#005691',
    accent: '#E84545',
  },
}

export const theme = extendTheme(
  {
    colors,
    fonts: {
      heading: `'Plus Jakarta Sans', 'Segoe UI', sans-serif`,
      body: `'Plus Jakarta Sans', 'Segoe UI', sans-serif`,
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
            _hover: { bg: '#004578' },
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
