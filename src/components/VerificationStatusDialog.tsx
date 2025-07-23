
"use client";

import { DocumentData } from 'firebase/firestore';
import VerifiedAvatar from './VerifiedAvatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface VerificationStatusDialogProps {
  user: DocumentData | null;
  type: 'granted' | 'revoked';
  onClose: () => void;
  dictionary: {
    grantedTitle: string;
    grantedDescription: string;
    revokedTitle: string;
    revokedDescription: string;
    close: string;
  };
}

export default function VerificationStatusDialog({
  user,
  type,
  onClose,
  dictionary,
}: VerificationStatusDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const title = type === 'granted' ? dictionary.grantedTitle : dictionary.revokedTitle;
  const description = type === 'granted' ? dictionary.grantedDescription : dictionary.revokedDescription;

  return (
    <>
      <style jsx>{`
        .fly-in {
          animation: fly-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }
        .pop-out {
          animation: pop-out 0.3s ease-in-out forwards;
        }
        @keyframes fly-in {
          0% {
            transform: translate(50px, -50px) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }
        @keyframes pop-out {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-sm text-center animate-in fade-in-0 zoom-in-95">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6">{description}</p>
            <div className="flex justify-center mb-6">
              <VerifiedAvatar
                user={user}
                className="h-24 w-24"
                fallbackClassName="text-3xl"
                showBadge={false}
                badgeAnimation={isAnimating ? type : null}
              />
            </div>
            <Button onClick={onClose} className="w-full">
              {dictionary.close}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

