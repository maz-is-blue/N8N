import { Handle, Position } from 'reactflow';
import { RefreshCw } from 'lucide-react';

export function TransformNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-purple-50 border-2 border-purple-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-purple-600" />
        <div>
          <div className="text-xs text-gray-500 uppercase">Transform</div>
          <div className="font-medium text-sm">{data.label || 'Transform'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
