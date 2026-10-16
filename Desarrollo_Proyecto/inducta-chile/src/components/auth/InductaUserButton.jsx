import { UserButton } from '@clerk/clerk-react'
import { clerkAppearance, userProfileAppearance } from '../../theme/clerkAppearance'

export default function InductaUserButton({ afterSignOutUrl = '/' }) {
  return (
    <UserButton
      afterSignOutUrl={afterSignOutUrl}
      appearance={clerkAppearance}
      userProfileProps={{
        appearance: userProfileAppearance,
      }}
    />
  )
}
