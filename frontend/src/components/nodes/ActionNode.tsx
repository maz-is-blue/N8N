import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export function ActionNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-blue-50 border-2 border-blue-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-xs text-gray-500 uppercase">Action</div>
          <div className="font-medium text-sm">{data.label || 'Action'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
