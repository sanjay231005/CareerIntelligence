import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessingStage } from '@/types';
import { PROCESSING_STAGES } from '@/constants';

interface ProcessingStagesProps {
  currentStage: ProcessingStage;
}

const STAGE_ORDER: ProcessingStage[] = [
  'uploading', 'extracting_audio', 'transcribing', 'validating',
  'processing_ai', 'extracting_actions', 'mapping_participants', 'saving', 'done'
];

export default function ProcessingStages({ currentStage }: ProcessingStagesProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="space-y-2">
      {PROCESSING_STAGES.map((stage, idx) => {
        const stageIdx = STAGE_ORDER.indexOf(stage.key as ProcessingStage);
        const isDone = currentIdx > stageIdx || currentStage === 'done';
        const isActive = STAGE_ORDER[currentIdx] === stage.key;
        const isPending = stageIdx > currentIdx;

        return (
          <div key={stage.key} className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
            isActive && 'bg-primary/10 border border-primary/20',
            isDone && 'opacity-60',
            isPending && 'opacity-30'
          )}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
              isDone && 'bg-emerald-500 text-white',
              isActive && 'bg-primary text-white',
              isPending && 'bg-muted text-muted-foreground'
            )}>
              {isDone ? <Check className="w-3.5 h-3.5" /> :
               isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               <Circle className="w-3 h-3" />}
            </div>
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', isActive && 'text-primary')}>{stage.label}</p>
              {isActive && <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
