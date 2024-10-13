import React, { useState, useCallback } from 'react';
import ReactFlow, { addEdge, Background, Controls, MiniMap, MarkerType, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { generateColorPalette, autoAddVertices, autoAddEdges } from './graphUtils';
import { geneticColoring } from './geneticAlgorithm';

const GraphColoringApp = () => {
	const initialNodes = [];
	const initialEdges = [];

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [numVertices, setNumVertices] = useState('');
	const [connections, setConnections] = useState('');
	const [iterations, setIterations] = useState('');
	const [populationSize, setPopulationSize] = useState('');
	const [status, setStatus] = useState('Статус: очікування дій');
	const [colorPalette, setColorPalette] = useState([]);

	const onConnect = useCallback((params) => {
		setEdges((eds) =>
			addEdge(
				{
					...params,
					markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
					style: { stroke: 'black', strokeWidth: 1.5 }
				},
				eds
			)
		);
	}, [setEdges]);

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

		const solution = geneticColoring(nodes, edges, maxColors, numIterations, popSize);
		const usedColors = new Set(Object.values(solution)).size;

		const newNodes = nodes.map(node => ({
			...node,
			style: {
				backgroundColor: colorPalette[(solution[node.id] - 1) % colorPalette.length],
				borderRadius: '50%',
				width: 50,
				height: 50,
				textAlign: 'center',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}
		}));

		setNodes(newNodes);
		setStatus(`Граф успішно розфарбовано. Використано ${usedColors} кольорів!`);
	};

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
		<div style={{ margin: "0 3%" }} className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Розфарбування графа</h1>

			<div style={{display: "flex", justifyContent: "space-between"}}>
				<div className="mb-4">
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
				</div>

				<div className="mb-4">
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

			<div style={{ padding: "0 15px"}}  className="border p-4">
				<p>{status}</p>
			</div>

			<div style={{ height: 600 }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
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
