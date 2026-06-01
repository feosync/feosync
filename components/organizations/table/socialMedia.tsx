"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectFacebookDialog } from "../ConnectFacebookDialog";
import { SocialCardProps } from "@/lib/api";
import { apiClient } from "@/lib/api/client";

// ─── Icônes SVG (inchangées — couleurs de marque) ────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
    </svg>
  ),
  threads: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" className="w-8 h-8 fill-white">
      <path d="M141.537 88.988a66 66 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553M98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274" />
    </svg>
  ),
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    </svg>
  ),
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
    </svg>
  ),
  bluesky: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 568 501" className="w-8 h-8 fill-white">
      <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.889-129.52 80.986-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.66 0 75.293 0 57.947 0-28.906 76.135-1.61 123.121 33.664Z" />
    </svg>
  ),
  youtube: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.54-.123 1.07-.24 1.468a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
    </svg>
  ),
  tiktok: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
    </svg>
  ),
  mastodon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 79" className="w-8 h-8 fill-white">
      <path d="M73.7014 17.8382C72.7006 11.2315 66.9215 5.97073 59.9996 4.9995C58.8399 4.82791 54.2535 4.17636 43.6891 4.17636H43.6139C33.0495 4.17636 30.7163 4.82791 29.5566 4.9995C22.8018 6.00636 16.7566 10.7013 15.1499 17.3859C14.3672 20.7218 14.2809 24.3927 14.4323 27.7886C14.6523 32.6527 14.6915 37.5082 15.1311 42.3559C15.4303 45.5963 15.9517 48.8128 16.6919 51.9673C18.1533 58.1922 24.2003 63.4468 30.2456 65.5697C36.7008 67.8099 43.7557 68.1882 50.4152 66.6628C51.1537 66.4943 51.8786 66.3018 52.5896 66.0858C54.1775 65.5922 56.0225 65.0425 57.3931 64.0282C57.4114 64.0149 57.4257 63.9974 57.435 63.9773C57.4444 63.957 57.4485 63.9349 57.4469 63.9127V58.4938C57.4461 58.4726 57.4407 58.4517 57.431 58.4327C57.4213 58.4137 57.4075 58.3969 57.3906 58.3837C57.3736 58.3705 57.354 58.3611 57.333 58.3562C57.312 58.3513 57.2902 58.3509 57.2691 58.3552C52.9601 59.3619 48.546 59.8691 44.1162 59.8693C36.5651 59.8693 34.5213 56.2651 33.9418 54.8021C33.4806 53.6099 33.1994 52.3576 33.1072 51.0870C33.106 51.0655 33.1104 51.044 33.12 51.0245C33.1296 51.005 33.1441 50.9882 33.1622 50.9756C33.1803 50.963 33.2015 50.9551 33.2237 50.9525C33.2459 50.9499 33.2684 50.9527 33.2891 50.9608C37.5081 51.9385 41.8296 52.4338 46.1651 52.4379C47.2152 52.4379 48.2621 52.4379 49.3122 52.4103C53.6683 52.2933 58.2599 52.0722 62.5574 51.2468C62.6644 51.2257 62.7714 51.2078 62.8632 51.1832C69.5976 49.8386 75.9666 45.8093 76.6468 35.4836C76.6697 35.0982 76.7233 31.4327 76.7233 31.032C76.7257 29.6614 77.1521 21.2283 73.7014 17.8382ZM64.2444 43.0933H55.9815V23.9688C55.9815 19.8524 54.2028 17.7488 50.6266 17.7488C46.6929 17.7488 44.7213 20.2196 44.7213 25.1024V34.8177H36.5151V25.1024C36.5151 20.2196 34.5435 17.7488 30.6098 17.7488C27.0588 17.7488 25.2648 19.8524 25.2648 23.9688V43.0933H16.9998V23.4057C16.9998 19.2893 18.0748 16.0262 20.2276 13.6171C22.4533 11.2091 25.3786 9.97286 29.0178 9.97286C33.2516 9.97286 36.4609 11.5395 38.5967 14.6666L40.7374 18.1296L42.8812 14.6666C45.017 11.5395 48.2263 9.97286 52.4601 9.97286C56.0993 9.97286 59.0246 11.2091 61.2534 13.6171C63.4062 16.0262 64.4812 19.2893 64.4812 23.4057L64.2444 43.0933Z" />
    </svg>
  ),
  pinterest: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M8 0a8 8 0 0 0-2.915 15.452c-.07-.633-.134-1.606.027-2.297.146-.625.984-4.170.984-4.170s-.251-.503-.251-1.247c0-1.168.679-2.042 1.523-2.042.719 0 1.067.54 1.067 1.187 0 .723-.461 1.807-.699 2.814-.198.840.421 1.527 1.247 1.527 1.497 0 2.649-1.578 2.649-3.855 0-2.016-1.449-3.426-3.516-3.426-2.394 0-3.798 1.795-3.798 3.653 0 .723.279 1.497.626 1.921a.25.25 0 0 1 .058.240c-.063.264-.204.840-.232.957-.037.154-.124.187-.285.113-1.053-.491-1.711-2.033-1.711-3.271 0-2.659 1.932-5.102 5.575-5.102 2.927 0 5.204 2.086 5.204 4.873 0 2.907-1.832 5.245-4.375 5.245-.854 0-1.659-.444-1.934-.968l-.526 1.963c-.190.734-.706 1.652-1.052 2.212A8 8 0 1 0 8 0" />
    </svg>
  ),
  twitter: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
  ),
  whatsapp: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-8 h-8 fill-white">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  ),
};

// ─── Catalogue canaux (couleurs de marque — intentionnellement hors tokens) ──

const CHANNELS: SocialCardProps[] = [
  { id: "instagram", name: "Instagram",   sub: "Business, Creator ou Personnel", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]", isSocialOpen: false, icon: ICONS.instagram },
  { id: "threads",   name: "Threads",     sub: "Profil",                          bg: "bg-[#000000]",  isSocialOpen: false, icon: ICONS.threads   },
  { id: "linkedin",  name: "LinkedIn",    sub: "Page ou Profil",                  bg: "bg-[#0A66C2]",  isSocialOpen: false, icon: ICONS.linkedin  },
  { id: "facebook",  name: "Facebook",    sub: "Page ou Groupe",                  bg: "bg-[#1877F2]",  isSocialOpen: false, icon: ICONS.facebook  },
  { id: "bluesky",   name: "Bluesky",     sub: "Profil",                          bg: "bg-[#0085FF]",  isSocialOpen: false, icon: ICONS.bluesky   },
  { id: "youtube",   name: "YouTube",     sub: "Chaîne",                          bg: "bg-[#FF0000]",  isSocialOpen: false, icon: ICONS.youtube   },
  { id: "tiktok",    name: "TikTok",      sub: "Profil",                          bg: "bg-[#010101]",  isSocialOpen: false, icon: ICONS.tiktok    },
  { id: "mastodon",  name: "Mastodon",    sub: "Profil",                          bg: "bg-[#6364FF]",  isSocialOpen: false, icon: ICONS.mastodon  },
  { id: "pinterest", name: "Pinterest",   sub: "Profil",                          bg: "bg-[#E60023]",  isSocialOpen: false, icon: ICONS.pinterest },
  { id: "twitter",   name: "X / Twitter", sub: "Profil",                          bg: "bg-[#000000]",  isSocialOpen: false, icon: ICONS.twitter   },
  { id: "whatsapp",  name: "WhatsApp",    sub: "Business",                        bg: "bg-[#25D366]",  isSocialOpen: false, icon: ICONS.whatsapp  },
];

interface ManageSocialMediaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ManageSocialMedia({ open, onOpenChange, orgId }: ManageSocialMediaProps) {
  const [selectedChannel, setSelectedChannel] = useState<SocialCardProps | null>(null);
  const [connectOpen, setConnectOpen]         = useState(false);
  const [connectedChannels, setConnectedChannels] = useState<SocialCardProps[]>([]);
  const [loadingChannels, setLoadingChannels]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchChannels = async () => {
      setLoadingChannels(true);
      try {
        const data = await apiClient.getChannelByUser();
        if (cancelled) return;
        const matched = CHANNELS.filter((ch) =>
          data.some((d: { name: string }) => d.name.toLowerCase() === ch.name.toLowerCase())
        );
        setConnectedChannels(matched);
      } catch (err) {
        console.error("Erreur lors du chargement des canaux :", err);
        if (!cancelled) setConnectedChannels([]);
      } finally {
        if (!cancelled) setLoadingChannels(false);
      }
    };
    fetchChannels();
    return () => { cancelled = true };
  }, [orgId]);

  const handleChannelSelect = (channel: SocialCardProps) => {
    setSelectedChannel(channel);
    onOpenChange(false);
    setConnectOpen(true);
  };

  const handleConnectOpenChange = (value: boolean) => {
    setConnectOpen(value);
    if (!value) setSelectedChannel(null);
  };

  const previewChannels = connectedChannels.slice(-3);

  return (
    <>
      {/* ── Barre sociale ── */}
      <div className="flex items-center justify-start p-2 rounded-xl h-14 w-full relative">

        {/* Icônes canaux connectés */}
        {!loadingChannels && previewChannels.map((ch, index) => {
          const rightOffset = 4 + (previewChannels.length - index) * 8 + (previewChannels.length - index - 1) * (-1);
          return (
            <div
              key={ch.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center p-2
                         shrink-0 shadow-md absolute z-0 ${ch.bg}`}
              style={{ right: `${rightOffset * 3.5}px` }}
              title={ch.name}
            >
              {ch.icon}
            </div>
          );
        })}

        {/* Skeletons chargement */}
        {loadingChannels && [0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-muted animate-pulse absolute z-0"
            style={{ right: `${(4 + (3 - i) * 8 + (3 - i - 1) * 2) * 4}px` }}
          />
        ))}

        {/* Bouton "+" */}
        <button
          onClick={() => onOpenChange(true)}
          className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center
                     hover:opacity-90 active:scale-95 transition-all cursor-pointer
                     shrink-0 shadow-md absolute right-2 z-10
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ajouter un réseau social"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-background"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* ── Dialog picker ── */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl border border-border">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-sm lg:text-lg font-semibold text-center text-foreground tracking-tight">
              Connecter un nouveau canal
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 p-2 max-h-[70vh] overflow-y-auto">
            {CHANNELS.map((ch) => {
              const isConnected = connectedChannels.some((c) => c.id === ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch)}
                  className="group flex flex-col items-center gap-2.5 p-3 rounded-lg
                             text-center transition-colors duration-150
                             hover:bg-muted
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                             cursor-pointer"
                >
                  {/* Icône réseau */}
                  <span className={`flex items-center justify-center w-16 h-16 rounded-xl
                                   shadow-sm ${ch.bg} transition-transform duration-150
                                   group-hover:scale-105 relative shrink-0`}>
                    {ch.icon}
                    {/* Badge connecté */}
                    {isConnected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full
                                       bg-emerald-500 border-2 border-background" />
                    )}
                  </span>

                  {/* Texte */}
                  <span className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground leading-tight">
                      {ch.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {ch.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog connexion Facebook ── */}
      {selectedChannel?.name === "Facebook" && (
        <ConnectFacebookDialog
          open={connectOpen}
          onOpenChange={handleConnectOpenChange}
          orgId={orgId}
        />
      )}
    </>
  );
}