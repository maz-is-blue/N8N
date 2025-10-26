import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader, Clock } from 'lucide-react';
import { executionsApi } from '../lib/api';

export function RunDetails() {
  const { id: workflowId, runId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['run-details', runId],
    queryFn: () => executionsApi.getRunDetails(Number(runId)),
    refetchInterval: (query) => {
      return query.state.data?.run.status === 'running' ? 2000 : false;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading run details...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Run not found</div>
      </div>
    );
  }

  const { run, steps } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={`/workflows/${workflowId}/runs`}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Run Details</h1>
            <p className="text-gray-600 mt-1">
              Started: {new Date(run.started_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Run Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(run.status)}
                <span className="font-medium capitalize">{run.status}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Duration</div>
              <div className="font-medium">
                {run.finished_at
                  ? `${Math.round(
                      (new Date(run.finished_at).getTime() -
                        new Date(run.started_at).getTime()) /
                        1000
                    )}s`
                  : 'In progress...'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Steps</div>
              <div className="font-medium">{steps.length}</div>
            </div>
          </div>

          {run.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800">Error</div>
              <div className="text-sm text-red-600 mt-1">{run.error}</div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Execution Steps</h2>
          {steps.map((step, index) => (
            <div key={step.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{step.node_id}</div>
                    <div className="text-sm text-gray-500">{step.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="text-sm capitalize">{step.status}</span>
                </div>
              </div>

              {/* Logs */}
              {step.logs && step.logs.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Logs</div>
                  <div className="bg-gray-50 rounded p-3 space-y-1 max-h-48 overflow-y-auto">
                    {step.logs.map((log: any, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600 font-mono">
                        {log.timestamp && (
                          <span className="text-gray-400 mr-2">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                        {log.message || log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {step.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-600 mt-1">{step.error}</div>
                </div>
              )}

              {/* Output */}
              {step.output && (
                <details className="mt-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Output
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 rounded p-3 overflow-x-auto">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
