export const geneticColoring = (nodes, edges, maxColors, iterations, popSize) => {

	const generateFitnessStagnation = () => {
		if (iterations > 1000 && nodes.length > 8) {
			return iterations / 100;
		}
		return 10;
	};

	const mutationRate = 0.1;
	const maxFitnessStagnation = generateFitnessStagnation();
	let fitnessStagnationCounter = 0;
	let lastBestFitness = Infinity;

	const initializePopulation = () => {
		return Array.from({ length: popSize }, () => {
			const individual = {};
			nodes.forEach(node => {
				individual[node.id] = Math.floor(Math.random() * maxColors) + 1;
			});
			return individual;
		});
	};

	const fitness = (individual) => {
		let conflicts = 0;
		edges.forEach(edge => {
			if (individual[edge.source] === individual[edge.target]) {
				conflicts++;
			}
		});
		const usedColors = new Set(Object.values(individual)).size;
		return conflicts * 1000 + usedColors;
	};

	const crossover = (parent1, parent2) => {
		const offspring = {};
		nodes.forEach(node => {
			offspring[node.id] = Math.random() < 0.5 ? parent1[node.id] : parent2[node.id];
		});
		return offspring;
	};

	const mutate = (individual) => {
		nodes.forEach(node => {
			if (Math.random() < mutationRate) {
				individual[node.id] = Math.floor(Math.random() * maxColors) + 1;
			}
		});
	};

	const evolve = (population, iteration) => {
		population.sort((a, b) => fitness(a) - fitness(b));
		const bestIndividual = population[0];
		const bestFitness = fitness(bestIndividual);

		console.log(`Ітерація: ${iteration}`);
		console.log(`Найкраще рішення:`, bestIndividual);
		console.log(`Фітнес найкращого рішення: ${bestFitness}`);

		if (bestFitness === lastBestFitness) {
			fitnessStagnationCounter++;
		} else {
			fitnessStagnationCounter = 0;
		}

		if (fitnessStagnationCounter >= maxFitnessStagnation) {
			console.log(`Зупинка через стагнацію фітнесу на ітерації: ${iteration}`);
			return { newPopulation: population, stop: true };
		}

		lastBestFitness = bestFitness;

		const newPopulation = [];
		while (newPopulation.length < popSize) {
			const parent1 = population[Math.floor(Math.random() * (popSize / 2))];
			const parent2 = population[Math.floor(Math.random() * (popSize / 2))];
			let offspring = crossover(parent1, parent2);
			mutate(offspring);
			newPopulation.push(offspring);
		}

		return { newPopulation, stop: false };
	};

	let population = initializePopulation();
	console.log(population);
	let bestSolution = population[0];
	let iterationReached = 0;

	for (let i = 0; i < iterations; i++) {
		const { newPopulation, stop } = evolve(population, i);
		population = newPopulation;

		console.log(newPopulation);

		const currentBest = population[0];
		const currentBestFitness = fitness(currentBest);

		if (currentBestFitness < fitness(bestSolution)) {
			bestSolution = currentBest;
		}

		if (currentBestFitness === 0 || stop) {
			iterationReached = i + 1;
			console.log(`Алгоритм завершився на ітерації: ${iterationReached}`);
			break;
		}

		iterationReached = i + 1;
	}

	console.log(`Алгоритм завершився за ${iterationReached} ітерацій`);
	return bestSolution;
};
