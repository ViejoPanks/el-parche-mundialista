import Link from 'next/link';
import { Users, ChevronRight, User } from 'lucide-react';
import type { GroupWithMembership } from '@/lib/groups/queries';

export function GroupCard({ group }: { group: GroupWithMembership }) {
  return (
    <Link
      href={`/grupos/${group.id}`}
      className="group flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{group.name}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {group.member_count} {group.member_count === 1 ? 'miembro' : 'miembros'}
          </span>
          {group.role === 'admin' ? (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              Admin
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500">
              <User className="w-3 h-3" />
              Miembro
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition" />
    </Link>
  );
}
