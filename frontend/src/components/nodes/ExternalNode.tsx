import { Handle, Position } from 'reactflow';
import { ExternalLink } from 'lucide-react';

export function ExternalNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gray-50 border-2 border-gray-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-gray-600" />
        <div>
          <div className="text-xs text-gray-500 uppercase">External</div>
          <div className="font-medium text-sm">{data.label || 'n8n'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
