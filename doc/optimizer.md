# Optimizer General Description
The optimizer computes the optimal mix of products based on user criteria.

## Optimizer GUI
The mass is obtained from the user interface and used as a mass goal in the fitness function.
The user can also choose which one of following components hast the highest priority by assigning percentages:
 - Bridge.
 - Cost.
 - CO2.
 - Mass.

Furthermore, it is possible to filter products by environmental impact and select the products the user wants to use. Otherwise, the optimizer will use all the products available by default.
For the optimizer correct workflow it is also necessary bridge parameters since it has to aproximate to the optimal bridge. therefore, user has to introduce the bridge value and select an option (Average Poresize, Maximum Poresize and Permeability).
Finally, the optimizer will return the optimal mix in integer number of sacks and display a score in percents to show how close is the PSD to the optimal bridge.

## Optimization procedure
The optimizer uses genetic algorithm to get the optimal solution. This is an optimization technique based on Darwins Natural Selection Theory and uses some terms as population, chromosome, gene, selection, crossover and mutation. The genetic algorith has good performance when calculating integer solutions and that is the reason we choose.
Firstly, we have to initialize population, which are all possible solutions to the problem. Based on all list of products we create a random combination of products.
Then, we select what we call parents, the two best combinations based in our fitness function. 

### Fitness Function
The fitness function has 4 components: bridge or fit score, mass score, cost score and CO2 score. Based on a formula (for more details see the code) that uses weight imputs it calculates a fitness score which then is used for parents selection. 

### Select Parents
At each iteration of the algorithm, the two elements of the population with the lowest fitness scores are chosen to be the "parents" of the next generation. This means that
all members of the population at the next iteration (generation) will be generated as some combination of these two parents.

### Optimal Found
For each iteration the optimal found checks if the fitness of the current best combination is within the tolerance. If the fitness is within the tolerance or the amount of iterations have reached its maximum, then we return the current best combination.

### Crossover
When the two parents of a generation have been selected, all children are created as a combination of these. This optimizer utilizes so-called single-point crossover, meaning
that for every pair of two children, a sing crossover point is chosen, the two parents are sliced at this point, and the two children each get one slice from each parent. 

### Execute Mutation
Once the children have been generated from the parents, a random selection of these children, based on a set percentage chance, are then mutated, using one of three possible mutations, to see if improvements can be made.
These mutated children, alongside the unmutated ones and the parents, are then added back to the population.

### Swap Mutation
The swap mutation selects two random values from the childs content (i.e. number of sacks of products) and swaps them. After a swap bit mutatition, the child will have the number of sacks for two of its products swapped. The child is then returned to the population.

### Inversion Mutation
The inverse mutation selects a random startingpoint and a random endpoint. The mutation then reverses the values in the child from the random startingpoint to the random endpoint.

### Bit Flip Mutation
The bit flip mutation selects a random index of the child and adds or subtracts a random number in the range of the current value divided by two from that index value.

### Tuning
The algorithm contains some tuning variables (i.e. K_B, K_C, K_E, K_M). That's because the value of e.g CO2 is about three times bigger than the value of the cost. The tuning will set these values to about the same range so that the fitness value will be equally affected by the different values so that the user selected weighting works. 
