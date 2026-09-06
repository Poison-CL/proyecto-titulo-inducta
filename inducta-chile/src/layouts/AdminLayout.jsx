import { AppShell, NavItem, Sidebar, SidebarSection } from '@saas-ui/react'
import { UserButton } from '@clerk/clerk-react'

export default function AdminLayout({ children }) {
  return (
    <AppShell
      sidebar={
        <Sidebar>
          <SidebarSection flex="1">
            <NavItem href="/dashboard">Inicio</NavItem>
            <NavItem href="/dashboard/empresa">Empresa</NavItem>
            <NavItem href="/dashboard/evaluaciones">Evaluaciones</NavItem>
          </SidebarSection>
          <SidebarSection>
            <UserButton />
          </SidebarSection>
        </Sidebar>
      }
    >
      {children}
    </AppShell>
  )
}
