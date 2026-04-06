'use client'

import { useState } from 'react'
import { Facebook, Instagram, Twitter, MessageCircle, Linkedin, Lock } from 'lucide-react'
import { ConnectFacebookDialog } from '@/components/organizations/ConnectFacebookDialog'

interface Channel {
  id: string
  label: string
  icon: React.ElementType
  available: boolean
  color: string
}

const CHANNELS: Channel[] = [
  { id: 'facebook',  label: 'Facebook',  icon: Facebook,       available: true,  color: 'text-blue-600'  },
  { id: 'instagram', label: 'Instagram', icon: Instagram,      available: false, color: 'text-pink-500'  },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: MessageCircle,  available: false, color: 'text-green-500' },
  { id: 'twitter',   label: 'X / Twitter', icon: Twitter,      available: false, color: 'text-slate-800' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,       available: false, color: 'text-blue-700'  },
]

interface OrgChannelPickerProps {
  orgId: string
  onClose?: () => void
}

export function OrgChannelPicker({ orgId, onClose }: OrgChannelPickerProps) {
  const [fbDialogOpen, setFbDialogOpen] = useState(false)

  const handleChannel = (channel: Channel) => {
    if (!channel.available) return
    if (channel.id === 'facebook') {
      setFbDialogOpen(true)
    }
  }

  return (
    <>
      <div className="py-1">
        {CHANNELS.map(channel => {
          const Icon = channel.icon
          return (
            <button
              key={channel.id}
              disabled={!channel.available}
              onClick={() => handleChannel(channel)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-[13px] rounded-md transition-colors
                ${channel.available
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${channel.color}`} />
              <span className="flex-1 text-left text-slate-700 dark:text-slate-300">
                {channel.label}
              </span>
              {!channel.available && (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
              {channel.available && (
                <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                  Disponible
                </span>
              )}
            </button>
          )
        })}
      </div>

      <ConnectFacebookDialog
        open={fbDialogOpen}
        onOpenChange={open => {
          setFbDialogOpen(open)
          if (!open) onClose?.()
        }}
        orgId={orgId}
      />
    </>
  )
}