'use client';

import { useEffect, useState } from 'react';
import { Clock, Lock } from 'lucide-react';
import type { LockoutInfo } from '@/lib/special-predictions/queries';

export function LockoutBanner({ lockoutInfo }: { lockoutInfo: LockoutInfo }) {
  const [now, setNow] = useState(() => Date.now());

  // Tick cada segundo (solo si no está bloqueado)
  useEffect(() => {
    if (lockoutInfo.isLocked || !lockoutInfo.lockoutAt) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockoutInfo.isLocked, lockoutInfo.lockoutAt]);

  // Si ya está bloqueado
  if (lockoutInfo.isLocked) {
    return (
      <div className="flex items-center gap-3 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl">
        <Lock className="w-6 h-6 text-red-700 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-red-900 tracking-wider">
            PREDICCIONES BLOQUEADAS
          </p>
          <p className="text-sm font-medium text-red-800">
            El torneo ya arrancó · No se pueden modificar
          </p>
        </div>
      </div>
    );
  }

  // Si no hay lockout configurado
  if (!lockoutInfo.lockoutAt) {
    return (
      <div className="flex items-center gap-3 p-3 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
        <Clock className="w-6 h-6 text-blue-700 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-900 tracking-wider">
            FECHA DE BLOQUEO PENDIENTE
          </p>
          <p className="text-sm font-medium text-blue-800">
            Aún no se ha definido el primer partido
          </p>
        </div>
      </div>
    );
  }

  // Calcular tiempo restante
  const lockoutMs = new Date(lockoutInfo.lockoutAt).getTime();
  const remainingMs = Math.max(0, lockoutMs - now);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeText = '';
  if (days > 0) {
    timeText = `${days} ${days === 1 ? 'día' : 'días'}, ${hours} ${hours === 1 ? 'hora' : 'horas'}, ${minutes} min`;
  } else if (hours > 0) {
    timeText = `${hours} ${hours === 1 ? 'hora' : 'horas'}, ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (minutes > 0) {
    timeText = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}, ${seconds} seg`;
  } else {
    timeText = `${seconds} segundos`;
  }

  return (
    <div className="flex items-center gap-3 p-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
      <Clock className="w-6 h-6 text-amber-700 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-900 tracking-wider">
          SE BLOQUEAN EN
        </p>
        <p className="text-lg font-medium text-amber-900 font-mono">
          {timeText}
        </p>
      </div>
    </div>
  );
}
