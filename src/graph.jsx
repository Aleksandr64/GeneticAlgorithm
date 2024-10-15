import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
	addEdge,
	Background,
	Controls,
	MiniMap,
	MarkerType,
	useNodesState,
	useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { generateColorPalette, autoAddVertices, autoAddEdges } from './graphUtils';
import { geneticColoring } from './geneticAlgorithm';
import { reconnectEdge } from '@xyflow/react';

const GraphColoringApp = () => {
	const initialNodes = [];
	const initialEdges = [];
	const edgeReconnectSuccessful = useRef(true);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [numVertices, setNumVertices] = useState('');
	const [connections, setConnections] = useState('');
	const [iterations, setIterations] = useState('');
	const [populationSize, setPopulationSize] = useState('');
	const [status, setStatus] = useState('Статус: очікування дій');
	const [colorPalette, setColorPalette] = useState([]);
	const [selectedNode, setSelectedNode] = useState(null); // Стан для вибраної вершини

	// Додавання нової вершини
	const addNode = () => {
		const newId = nodes.length + 1;
		const newNode = {
			id: `${newId}`,
			position: { x: Math.random() * 800, y: Math.random() * 400 },
			data: { label: `${newId + 1}` },
			style: {
				backgroundColor: '#D2E5FF',
				borderRadius: '50%',
				width: 50,
				height: 50,
				textAlign: 'center',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			},
			sourcePosition: 'right',
			targetPosition: 'left',
		};
		setNodes((nds) => [...nds, newNode]);
	};

	// Видалення вибраної вершини
	const deleteNode = () => {
		if (selectedNode) {
			setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
			setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
			setSelectedNode(null); // Очистити вибір після видалення
		}
	};

	const onNodeClick = useCallback((event, node) => {
		setSelectedNode(node); // Встановити вибрану вершину
	}, []);

	const onConnect = useCallback(
		(params) => {
			setEdges((eds) =>
				addEdge(
					{
						...params,
						markerEnd: { type: MarkerType.ArrowClosed, color: 'black' },
						style: { stroke: 'black', strokeWidth: 1.5 },
					},
					eds
				)
			);
		},
		[setEdges]
	);

	const handleAddVertices = () => {
		const result = autoAddVertices(numVertices, setNodes, nodes);
		setStatus(result);
	};

	const handleAddEdges = () => {
		const result = autoAddEdges(connections, setEdges, nodes, edges);
		setStatus(result);
	};

	const runAlgorithm = () => {
		const numIterations = parseInt(iterations);
		const popSize = parseInt(populationSize);

		if (isNaN(numIterations) || isNaN(popSize)) {
			setStatus('Помилка: введіть правильні значення для ітерацій та розміру популяції!');
			return;
		}

		const maxColors = nodes.length;
		const colorPalette = generateColorPalette(maxColors);
		setColorPalette(colorPalette);

		const { bestSolution, iterationReached } = geneticColoring(nodes, edges, maxColors, numIterations, popSize);

		const usedColors = new Set(Object.values(bestSolution)).size;

		const newNodes = nodes.map((node) => ({
			...node,
			style: {
				backgroundColor: colorPalette[(bestSolution[node.id] - 1) % colorPalette.length],
				borderRadius: '50%',
				width: 50,
				height: 50,
				textAlign: 'center',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			},
		}));

		setNodes(newNodes);
		setStatus(`Граф успішно розфарбовано за ${iterationReached} ітерацій. Використано ${usedColors} кольор${usedColors < 5 ? 'а' : 'ів'}!`);
	};

	const onReconnectStart = useCallback(() => {
		edgeReconnectSuccessful.current = false;
	}, []);

	const onReconnect = useCallback(
		(oldEdge, newConnection) => {
			edgeReconnectSuccessful.current = true;
			setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
		},
		[setEdges]
	);

	const onReconnectEnd = useCallback(
		(_, edge) => {
			if (!edgeReconnectSuccessful.current) {
				setEdges((eds) => eds.filter((e) => e.id !== edge.id));
			}

			edgeReconnectSuccessful.current = true;
		},
		[setEdges]
	);

	const resetAll = () => {
		setNodes([]);
		setEdges([]);
		setNumVertices('');
		setConnections('');
		setIterations('');
		setPopulationSize('');
		setStatus('Статус: очікування дій');
	};

	return (
		<div style={{ margin: '0 3%' }} className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Розфарбування графа</h1>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{width: "580px"}} className="mb-4">
					<input
						type="number"
						value={numVertices}
						onChange={(e) => setNumVertices(e.target.value)}
						placeholder="Кількість вершин"
						className="border p-2 mr-2"
					/>
					<button onClick={handleAddVertices} className="bg-blue-500 text-white p-2 rounded">
						Додати вершини
					</button>
					{/* Додавання нової вершини */}
					<button style={{ marginRight: "8px"}} onClick={addNode} className="bg-green-500 text-white p-2 mt-2 rounded">
						Додати одну вершину
					</button>
					{/* Видалення вибраної вершини */}
					<button
						onClick={deleteNode}
						disabled={!selectedNode}
						className={`bg-red-500 text-white p-2 mt-2 rounded ${!selectedNode ? 'opacity-50' : ''}`}
					>
						Видалити вибрану вершину
					</button>
				</div>

				<div style={{width: "360px"}} className="mb-4">
					<input
						type="number"
						value={connections}
						onChange={(e) => setConnections(e.target.value)}
						placeholder="Кількість зв'язків"
						className="border p-2 mr-2"
					/>
					<button onClick={handleAddEdges} className="bg-green-500 text-white p-2 rounded">
						Додати зв'язки
					</button>
				</div>

				<div className="mb-4">
					<input
						type="number"
						value={iterations}
						onChange={(e) => setIterations(e.target.value)}
						placeholder="Кількість ітерацій"
						className="border p-2 mr-2"
					/>
					<input
						type="number"
						value={populationSize}
						onChange={(e) => setPopulationSize(e.target.value)}
						placeholder="Розмір популяції"
						className="border p-2 mr-2"
					/>
					<button onClick={runAlgorithm} className="bg-purple-500 text-white p-2 rounded">
						Запустити алгоритм
					</button>
				</div>

				<div className="mb-4">
					<button onClick={resetAll} className="bg-red-500 text-white p-2 rounded">
						Скинути
					</button>
				</div>
			</div>

			<div style={{ padding: '0 15px' }} className="border p-4">
				<p>{status}</p>
			</div>

			<div style={{ height: "650px", margin: "15px 0" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onNodeClick={onNodeClick} // Додавання можливості вибору вершини
					onReconnect={onReconnect}
					onReconnectStart={onReconnectStart}
					onReconnectEnd={onReconnectEnd}
					onConnect={onConnect}
					fitView
				>
					<MiniMap />
					<Controls />
					<Background />
				</ReactFlow>
			</div>
		</div>
	);
};

export default GraphColoringApp;
