import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Node } from 'reactflow';
import { Save, Play, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { NodeInspector } from '../components/NodeInspector';
import { workflowsApi, executionsApi } from '../lib/api';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { promptToWorkflow } from '../utils/promptToWorkflow';

export function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [prompt, setPrompt] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const { nodes, edges, loadWorkflow, clearWorkflow } = useWorkflowStore();

  const isNewWorkflow = id === 'new';

  const { data: workflow } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsApi.getById(Number(id)),
    enabled: !isNewWorkflow && !!id,
  });

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');
      
      // Convert workflow JSON to React Flow format
      const workflowData = workflow.json;
      if (workflowData.nodes && workflowData.edges) {
        const rfNodes = workflowData.nodes.map((node: any) => ({
          id: node.id,
          type: getNodeTypeFromDataType(node.type),
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.props?.label || node.type,
            type: node.type,
            props: node.props,
          },
        }));

        const rfEdges = workflowData.edges.map((edge: any) => ({
          id: edge.id || `e${edge.source || edge.from}-${edge.target || edge.to}`,
          source: edge.source || edge.from,
          target: edge.target || edge.to,
          type: 'smoothstep',
          animated: true,
          label: edge.when,
        }));

        loadWorkflow(rfNodes, rfEdges);
      }
    } else if (isNewWorkflow) {
      clearWorkflow();
      setWorkflowName('');
      setWorkflowDescription('');
    }
  }, [workflow, isNewWorkflow, loadWorkflow, clearWorkflow]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const workflowJson = {
        name: workflowName,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type || node.type,
          props: node.data.props || {},
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          when: edge.label,
        })),
        version: 1,
      };

      if (isNewWorkflow) {
        return workflowsApi.create({
          name: workflowName,
          description: workflowDescription,
          json: workflowJson,
        });
      } else {
        return workflowsApi.update(Number(id), {
          name: workflowName,
          description: workflowDescription,
          json: workflowJson,
        });
      }
    },
    onSuccess: (data) => {
      toast.success('Workflow saved successfully!');
      if (isNewWorkflow) {
        navigate(`/workflows/${data.id}`);
      }
    },
    onError: () => {
      toast.error('Failed to save workflow');
    },
  });

  const executeMutation = useMutation({
    mutationFn: () => executionsApi.execute(Number(id)),
    onSuccess: (data) => {
      toast.success('Workflow executed successfully!');
      navigate(`/workflows/${id}/runs/${data.runId}`);
    },
    onError: () => {
      toast.error('Failed to execute workflow');
    },
  });

  const handleGenerateFromPrompt = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const generated = promptToWorkflow(prompt);
    setWorkflowName(generated.name);
    setWorkflowDescription(generated.description);
    loadWorkflow(generated.nodes, generated.edges);
    toast.success('Workflow generated!');
    setPrompt('');
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Workflow must have at least one node');
      return;
    }

    saveMutation.mutate();
  };

  const handleRun = () => {
    if (isNewWorkflow) {
      toast.error('Please save the workflow first');
      return;
    }
    executeMutation.mutate();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workflows')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
                className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Description (optional)"
                className="text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 mt-1 w-96"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleRun}
              disabled={executeMutation.isPending || isNewWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateFromPrompt()}
            placeholder="Describe your workflow... (e.g., 'Read from Google Sheets and send WhatsApp and Email')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateFromPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <WorkflowCanvas onNodeClick={setSelectedNode} />
        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

function getNodeTypeFromDataType(type: string): string {
  if (type.startsWith('trigger')) return 'trigger';
  if (type.startsWith('action')) return 'action';
  if (type === 'condition') return 'condition';
  if (type === 'transform') return 'transform';
  if (type.startsWith('external')) return 'external';
  return 'action';
}
