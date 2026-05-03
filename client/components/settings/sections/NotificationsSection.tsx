'use client'

import { useState } from 'react'
import { SettingsCard } from '../SettingsCard'
import { SettingRow } from '../SettingRow'
import { Toggle } from '../Toggle'

export function NotificationsSection() {
  const [emailNotifs,  setEmailNotifs]  = useState(true)
  const [pushNotifs,   setPushNotifs]   = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [mentionOnly,  setMentionOnly]  = useState(false)

  return (
    <div className="space-y-4">
      <SettingsCard title="Email">
        <SettingRow
          label="Notifications email"
          description="Recevez les alertes importantes par email"
        >
          <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
        </SettingRow>
        <SettingRow
          label="Résumé hebdomadaire"
          description="Un email récapitulatif chaque lundi matin"
        >
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} disabled={!emailNotifs} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Application">
        <SettingRow
          label="Notifications push"
          description="Alertes en temps réel dans l'application"
        >
          <Toggle checked={pushNotifs} onChange={setPushNotifs} />
        </SettingRow>
        <SettingRow
          label="Mentions uniquement"
          description="Être notifié seulement quand quelqu'un vous mentionne"
        >
          <Toggle checked={mentionOnly} onChange={setMentionOnly} disabled={!pushNotifs} />
        </SettingRow>
      </SettingsCard>
    </div>
  )
}