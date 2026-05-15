import Link from "next/link";
import { Eye, Heart, Pencil, Star, User } from "lucide-react";
import { Button } from "@/components/Button";
import { UserProfile as UserProfileType } from "@/types/user";
import { formatDate } from "@/utils/format";

interface UserProfileProps {
  profile: UserProfileType;
  onEdit?: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}

/** Count + link to the matching list page — doubles as the profile's stats. */
function StatCard({ icon, label, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-zinc-100">{value}</p>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      </div>
    </Link>
  );
}

export function UserProfile({ profile, onEdit }: UserProfileProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <User className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{profile.displayName}</h1>
            {profile.email && (
              <p className="text-sm text-zinc-500">{profile.email}</p>
            )}
            <p className="mt-1 text-xs text-zinc-600">
              Membro desde {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            leftIcon={<Pencil className="h-4 w-4" />}
          >
            Editar perfil
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Avaliações"
          value={profile.ratingsCount}
          href="/ratings"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Favoritos"
          value={profile.favoritesCount}
          href="/favorites"
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Assistidos"
          value={profile.watchedCount}
          href="/watched"
        />
      </div>
    </div>
  );
}
