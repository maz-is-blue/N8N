import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

interface NodeInspectorProps {
  node: Node | null;
  onClose: () => void;
}

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  const { updateNode, deleteNode } = useWorkflowStore();
  const [label, setLabel] = useState('');
  const [props, setProps] = useState<any>({});

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setProps(node.data.props || {});
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    updateNode(node.id, { label, props });
    onClose();
  };

  const handleDelete = () => {
    deleteNode(node.id);
    onClose();
  };

  const handlePropChange = (key: string, value: any) => {
    setProps({ ...props, [key]: value });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-10">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Node Properties</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            {node.data.type || node.type}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Properties
          </label>
          <div className="space-y-2">
            {Object.entries(props).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{key}</label>
                <textarea
                  value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handlePropChange(key, parsed);
                    } catch {
                      handlePropChange(key, e.target.value);
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={typeof value === 'object' ? 4 : 1}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
