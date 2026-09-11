// Estilos para que los componentes de Clerk se vean como el resto del sitio
export const clerkAppearance = {
  variables: {
    colorPrimary: '#005691',
    colorDanger: '#E84545',
    colorSuccess: '#2B2E4A',
    colorText: '#2B2E4A',
    colorTextSecondary: '#6B7280',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F0F5F9',
    colorInputText: '#2B2E4A',
    colorNeutral: '#2B2E4A',
    borderRadius: '0.75rem',
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    fontFamilyButtons: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  },
  elements: {
    // Avatar / boton
    userButtonAvatarBox: {
      width: '36px',
      height: '36px',
      border: '2px solid #F0F5F9',
    },
    userButtonTrigger: {
      borderRadius: '999px',
      boxShadow: 'none',
      '&:focus': { boxShadow: '0 0 0 2px rgba(0,86,145,0.25)' },
    },
    // Menu desplegable
    userButtonPopoverCard: {
      borderRadius: '1rem',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 12px 40px rgba(43,46,74,0.12)',
      overflow: 'hidden',
    },
    userButtonPopoverMain: {
      backgroundColor: '#FFFFFF',
    },
    userPreviewMainIdentifier: {
      fontWeight: '600',
      color: '#2B2E4A',
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    },
    userPreviewSecondaryIdentifier: {
      color: '#6B7280',
    },
    userButtonPopoverActionButton: {
      borderRadius: '0.5rem',
      margin: '0 0.5rem',
      color: '#2B2E4A',
      '&:hover': {
        backgroundColor: '#F0F5F9',
        color: '#005691',
      },
    },
    userButtonPopoverActionButtonText: {
      fontWeight: '500',
    },
    userButtonPopoverFooter: {
      backgroundColor: '#F0F5F9',
      backgroundImage: 'none',
      borderTop: '1px solid rgba(0,0,0,0.06)',
    },
    // Modal perfil / cuenta
    modalContent: {
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(43,46,74,0.18)',
    },
    card: {
      borderRadius: '1rem',
      boxShadow: 'none',
    },
    navbar: {
      backgroundColor: '#F0F5F9',
      backgroundImage: 'none',
      borderRight: '1px solid rgba(0,0,0,0.06)',
    },
    navbarButton: {
      borderRadius: '0.5rem',
      color: '#2B2E4A',
      '&:hover': { backgroundColor: 'rgba(0,86,145,0.08)' },
    },
    navbarButtonActive: {
      backgroundColor: '#FFFFFF',
      color: '#005691',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    headerTitle: {
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      color: '#2B2E4A',
      fontWeight: '600',
    },
    headerSubtitle: {
      color: '#6B7280',
    },
    profileSectionTitleText: {
      color: '#2B2E4A',
      fontWeight: '600',
    },
    formButtonPrimary: {
      backgroundColor: '#005691',
      borderRadius: '999px',
      fontWeight: '600',
      boxShadow: 'none',
      '&:hover': { backgroundColor: '#004578' },
    },
    formFieldInput: {
      borderRadius: '0.75rem',
      backgroundColor: '#F0F5F9',
      borderColor: 'transparent',
    },
    badge: {
      backgroundColor: '#F0F5F9',
      color: '#005691',
    },
    footer: {
      backgroundColor: '#F0F5F9',
      backgroundImage: 'none',
    },
  },
}

export const userProfileAppearance = {
  variables: clerkAppearance.variables,
  elements: {
    ...clerkAppearance.elements,
    rootBox: { width: '100%' },
    scrollBox: { backgroundColor: '#FFFFFF' },
    pageScrollBox: { backgroundColor: '#FFFFFF' },
  },
}
