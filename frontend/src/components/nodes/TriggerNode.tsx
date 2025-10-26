import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export function TriggerNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-green-50 border-2 border-green-500 min-w-[150px]">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-green-600" />
        <div>
          <div className="text-xs text-gray-500 uppercase">Trigger</div>
          <div className="font-medium text-sm">{data.label || 'Trigger'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
