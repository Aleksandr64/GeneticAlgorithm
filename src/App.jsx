import React, { useState, useEffect, useCallback } from 'react';
import Graph from 'react-graph-vis';

// Utility functions for the genetic algorithm
const generateRandomColor = () => Math.floor(Math.random() * 16777215).toString(16);

const fitness = (individual, edges) => {
  let conflicts = 0;
  for (const [v1, v2] of edges) {
    if (individual[v1] === individual[v2]) {
      conflicts++;
    }
  }
  return conflicts;
};

const crossover = (parent1, parent2) => {
  const child = {};
  Object.keys(parent1).forEach(node => {
    child[node] = Math.random() > 0.5 ? parent1[node] : parent2[node];
  });
  return child;
};

const mutation = (individual, maxColors) => {
  if (Math.random() < 0.1) {
    const node = Object.keys(individual)[Math.floor(Math.random() * Object.keys(individual).length)];
    individual[node] = Math.floor(Math.random() * maxColors);
  }
  return individual;
};

const geneticAlgorithm = (nodes, edges, maxColors, maxGenerations = 1000) => {
  const populationSize = 100;
  let population = Array(populationSize).fill().map(() =>
      nodes.reduce((acc, node) => ({ ...acc, [node]: Math.floor(Math.random() * maxColors) }), {})
  );

  let bestIndividual = population[0];
  let bestFitness = fitness(bestIndividual, edges);

  for (let generation = 0; generation < maxGenerations; generation++) {
    const newPopulation = [];
    for (let i = 0; i < populationSize / 2; i++) {
      const parent1 = population[Math.floor(Math.random() * populationSize)];
      const parent2 = population[Math.floor(Math.random() * populationSize)];
      let child1 = crossover(parent1, parent2);
      let child2 = crossover(parent1, parent2);
      child1 = mutation(child1, maxColors);
      child2 = mutation(child2, maxColors);
      newPopulation.push(child1, child2);
    }

    population = newPopulation.sort((a, b) => fitness(a, edges) - fitness(b, edges));
    bestIndividual = population[0];
    bestFitness = fitness(bestIndividual, edges);

    if (bestFitness === 0) break;
  }

  return [bestIndividual, bestFitness];
};

function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [maxColors, setMaxColors] = useState(4);
  const [numVertices, setNumVertices] = useState(5);
  const [connectionsPerVertex, setConnectionsPerVertex] = useState(2);
  const [status, setStatus] = useState('Waiting for action');

  const updateGraph = useCallback(() => {
    const newGraph = {
      nodes: graph.nodes.map(node => ({
        ...node,
        color: node.color || '#97C2FC'
      })),
      edges: graph.edges
    };
    setGraph(newGraph);
  }, [graph]);

  const addVertices = () => {
    const newNodes = Array.from({ length: numVertices }, (_, i) => ({
      id: i + 1,
      label: `${i + 1}`
    }));
    setGraph({ nodes: newNodes, edges: [] });
    setStatus(`Added ${numVertices} vertices`);
  };

  const addEdges = () => {
    const newEdges = [];
    graph.nodes.forEach(node => {
      let connected = 0;
      while (connected < connectionsPerVertex) {
        const otherNode = graph.nodes[Math.floor(Math.random() * graph.nodes.length)];
        if (node.id !== otherNode.id && !newEdges.some(e =>
            (e.from === node.id && e.to === otherNode.id) ||
            (e.from === otherNode.id && e.to === node.id)
        )) {
          newEdges.push({ from: node.id, to: otherNode.id });
          connected++;
        }
      }
    });
    setGraph({ ...graph, edges: newEdges });
    setStatus(`Added ${connectionsPerVertex} connections per vertex`);
  };

  const colorGraph = () => {
    const [bestSolution, bestFitness] = geneticAlgorithm(
        graph.nodes.map(n => n.id),
        graph.edges.map(e => [e.from, e.to]),
        maxColors
    );

    if (bestFitness === 0) {
      setStatus(`Graph can be colored with ${maxColors} colors.`);
    } else {
      setStatus(`Best solution found with ${bestFitness} conflicts.`);
    }

    const coloredNodes = graph.nodes.map(node => ({
      ...node,
      color: `#${generateRandomColor()}`
    }));

    setGraph({ ...graph, nodes: coloredNodes });
  };

  useEffect(updateGraph, [updateGraph]);

  return (
      <div className="App">
        <h1>Graph Coloring with Genetic Algorithm</h1>
        <div>
          <label>
            Number of vertices:
            <input
                type="number"
                value={numVertices}
                onChange={(e) => setNumVertices(parseInt(e.target.value))}
            />
          </label>
          <button onClick={addVertices}>Add Vertices</button>
        </div>
        <div>
          <label>
            Connections per vertex:
            <input
                type="number"
                value={connectionsPerVertex}
                onChange={(e) => setConnectionsPerVertex(parseInt(e.target.value))}
            />
          </label>
          <button onClick={addEdges}>Add Edges</button>
        </div>
        <div>
          <label>
            Max colors:
            <input
                type="number"
                value={maxColors}
                onChange={(e) => setMaxColors(parseInt(e.target.value))}
            />
          </label>
          <button onClick={colorGraph}>Color Graph</button>
        </div>
        <div>Status: {status}</div>
        <div style={{ height: '500px' }}>
          <Graph
              graph={graph}
              options={{
                layout: { randomSeed: 1 },
                edges: { color: "#000000" },
                height: "100%"
              }}
          />
        </div>
      </div>
  );
}

export default App;