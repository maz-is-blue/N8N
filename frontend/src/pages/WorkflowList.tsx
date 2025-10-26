import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Trash2 } from 'lucide-react';
import { workflowsApi } from '../lib/api';
import toast from 'react-hot-toast';

export function WorkflowList() {
  const navigate = useNavigate();
  const { data: workflows, isLoading, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsApi.getAll,
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowsApi.delete(id);
      toast.success('Workflow deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <button
            onClick={() => navigate('/workflows/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading workflows...</div>
          </div>
        ) : workflows && workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {workflow.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {workflow.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Version {workflow.version}</span>
                  <span>{workflow.is_active ? '🟢 Active' : '⚫ Inactive'}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/workflows/${workflow.id}/runs`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No workflows yet</p>
            <button
              onClick={() => navigate('/workflows/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
