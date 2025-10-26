import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-yellow-50 border-2 border-yellow-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-yellow-600" />
        <div>
          <div className="text-xs text-gray-500 uppercase">Condition</div>
          <div className="font-medium text-sm">{data.label || 'Condition'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
