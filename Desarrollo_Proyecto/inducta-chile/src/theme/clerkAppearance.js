// Estilos para que los componentes de Clerk se vean como el resto del sitio
export const clerkAppearance = {
  variables: {
    colorPrimary: '#1B22A7',
    colorDanger: '#E84545',
    colorSuccess: '#0D0D0D',
    colorText: '#0D0D0D',
    colorTextSecondary: '#6B7280',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FAFAFA',
    colorInputText: '#0D0D0D',
    colorNeutral: '#0D0D0D',
    borderRadius: '0.75rem',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontFamilyButtons: "'Inter', 'Segoe UI', sans-serif",
  },
  elements: {
    userButtonAvatarBox: {
      width: '36px',
      height: '36px',
      border: '2px solid #FAFAFA',
    },
    userButtonTrigger: {
      borderRadius: '999px',
      boxShadow: 'none',
      '&:focus': { boxShadow: '0 0 0 2px rgba(0,86,145,0.25)' },
    },
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
      color: '#0D0D0D',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    userPreviewSecondaryIdentifier: {
      color: '#6B7280',
    },
    userButtonPopoverActionButton: {
      borderRadius: '0.5rem',
      margin: '0 0.5rem',
      color: '#0D0D0D',
      '&:hover': {
        backgroundColor: '#FAFAFA',
        color: '#1B22A7',
      },
    },
    userButtonPopoverActionButtonText: {
      fontWeight: '500',
    },
    userButtonPopoverFooter: {
      backgroundColor: '#FAFAFA',
      backgroundImage: 'none',
      borderTop: '1px solid rgba(0,0,0,0.06)',
    },
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
      backgroundColor: '#FAFAFA',
      backgroundImage: 'none',
      borderRight: '1px solid rgba(0,0,0,0.06)',
    },
    navbarButton: {
      borderRadius: '0.5rem',
      color: '#0D0D0D',
      '&:hover': { backgroundColor: 'rgba(0,86,145,0.08)' },
    },
    navbarButtonActive: {
      backgroundColor: '#FFFFFF',
      color: '#1B22A7',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    headerTitle: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#0D0D0D',
      fontWeight: '600',
    },
    headerSubtitle: {
      color: '#6B7280',
    },
    profileSectionTitleText: {
      color: '#0D0D0D',
      fontWeight: '600',
    },
    formButtonPrimary: {
      backgroundColor: '#1B22A7',
      borderRadius: '999px',
      fontWeight: '600',
      boxShadow: 'none',
      '&:hover': { backgroundColor: '#151A85' },
    },
    formFieldInput: {
      borderRadius: '0.75rem',
      backgroundColor: '#FAFAFA',
      borderColor: 'transparent',
    },
    badge: {
      backgroundColor: '#FAFAFA',
      color: '#1B22A7',
    },
    footer: {
      backgroundColor: '#FAFAFA',
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
