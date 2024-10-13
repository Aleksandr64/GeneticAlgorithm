export const generateColorPalette = (count) => {
	return Array.from({ length: count }, (_, i) => `hsl(${(360 / count) * i}, 100%, 50%)`);
};

export const autoAddVertices = (numVertices, setNodes, nodes) => {
	const n = parseInt(numVertices);
	if (isNaN(n)) {
		return 'Помилка: введіть правильне значення кількості вершин!';
	}

	const newNodes = Array.from({ length: n }, (_, i) => ({
		id: `${i + 1}`,
		position: { x: Math.random() * 800, y: Math.random() * 400 },
		data: { label: `${i + 1}` },
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
	}));

	setNodes([...nodes, ...newNodes]);
	return `Додано ${n} вершин!`;
};

export const autoAddEdges = (connections, setEdges, nodes, edges) => {
	const connectionsPerVertex = parseInt(connections);
	if (isNaN(connectionsPerVertex)) {
		return 'Помилка: введіть правильне значення зв\'язків!';
	}

	const newEdges = [];
	nodes.forEach((node) => {
		let connected = 0;
		while (connected < connectionsPerVertex) {
			const otherNode = nodes[Math.floor(Math.random() * nodes.length)];
			if (node.id !== otherNode.id && !newEdges.some(e =>
				(e.source === node.id && e.target === otherNode.id) ||
				(e.source === otherNode.id && e.target === node.id)
			)) {
				newEdges.push({
					id: `${node.id}-${otherNode.id}`,
					source: node.id,
					target: otherNode.id,
					markerEnd: { type: "arrowclosed", color: "black" },
					style: { stroke: 'black', strokeWidth: 1.5 },
				});
				connected++;
			}
		}
	});

	setEdges([...edges, ...newEdges]);
	return `Додано по ${connectionsPerVertex} зв'язків для кожної вершини!`;
};
