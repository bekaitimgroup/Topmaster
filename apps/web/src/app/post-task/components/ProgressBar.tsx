'use client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProgressBar({ step }: { step: number }) {
  const { t } = useLanguage();
  const steps = t.postTask.steps;

  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              background:
                i + 1 < step  ? 'linear-gradient(90deg, #7C3AED, #5B21B6)' :
                i + 1 === step ? 'linear-gradient(90deg, #7C3AED, #A78BFA)' :
                '#E4E4E7',
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs font-medium text-[#7C3AED]">{steps[step - 1]}</span>
        <span className="text-xs text-zinc-400">{step} / {steps.length}</span>
      </div>
    </div>
  );
}
