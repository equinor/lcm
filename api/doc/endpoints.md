# Frontend-Backend API layout
Restful API to pass data between the frontend and backend. Frontend fetches JSON data using a http request from the backend. JSON is sent from the frontend to request a specific backend action, which again will return JSON data to the frontend.
## Retrieve list of products
Request to retrieve list of all products (id, name, supplier) and their related metadata. By default it will return all the metadata. Names of products may change and not be unique, so use the id as the identifier in the frontend.
### Request syntax
Metadata provided in the list will be included. An empty list will return only id, name and supplier. Optional filters can be applied to retrieve a subset of all available products. Either or both of the min-max filters can be applied.
```yaml
{
    "request": "PRODUCT_LIST",
    // Optional
    "filters": [
        {
            "metadata": "CO2",
            "min": 25,
            "max": 1000
        },{
            "metadata": "COST",
            "min": 25,
            "max": 1000
        },{
            "metadata": "ENVIROMENTAL_IMPACT",
            "include": ["GREEN", "YELLOW", "RED", "BLACK"]
        },{
            "metadata": "SACK_SIZE",
            "min": 10,
            "max": 1000
        }
    ],
    "metadata": ["CO2", "COST", "ENVIROMENTAL_IMPACT", "SACK_SIZE","DISTRIBUTION"]
}
```
### Response syntax
```yaml
[
{
    "id": "1234124",
    "name": "Product1",
    "supplier": "Equinor",
    // Optional
    "co2": 1000,
    "cost": 300,
    "enviromental_impact": "Green",
    "sack_size": 25,
    "distribution": [0.1,0.05,0.5,0.35]
},{
    ...
}
]
```
## Retrieve product by id
Request to retrieve a specific product based on the id of the product. By default all metadata will be returned including name and supplier. Name and supplier will not be returned unless specified in the metadata list if metadata is provided.
### Request syntax
```yaml
{
    "request": "PRODUCT",
    "id": "1234124",
    // Optional
    "metadata": ["NAME", "SUPPLIER", "CO2", "COST", "ENVIROMENTAL_IMPACT", "SACK_SIZE", "DISTRIBUTION"]
}
```
### Response syntax
```yaml
{
    // Optional
    "name": "Product1",
    "supplier": "Equinor",
    "co2": 1000,
    "cost": 300,
    "enviromental_impact": "Green",
    "sack_size": 25,
    "distribution": [0.1,0.05,0.5,0.35],
    "cumulative": [10,60,90,100]
}
```
## Mix products
Send the mix of units and retrieve the the cumulative distribution and the PSD of the mix. 
### Request syntax
```yaml
{
    "request": "MIX_PRODUCTS",
    "products": [
        {
            "id": 41234,
            "percents": 42
        },{
            ...
        }
    ]
}
```
### Response syntax
```yaml
{
    "distribution": [0.1,0.05,0.5,0.35],
    "cumulative": [10,60,90,100]
}
```
## Find optimal blend
Returns the optimal mix in number of sacks. By default all products available in the database are used in the optimization. Products you want to optimize over can be specified in the request. Percent weights for best fit, mass fir, CO2, cost, and environmental impact are optional request parameters. By default best fit has a 100% weight. If no environmental is passed, all are included. If no max_iterations is passed, max_iterations will be set to 100. If no size_steps_filter, all size steps will be included.
### Request syntax
```yaml
{
    "request": "OPTIMAL_MIX",
    "name": "Optimizer 1",
    "value": 100,
    "option": "AVERAGE_PORESIZE",
    "mass": 350.0,
    // Optional
    "max_iterations": 69,
    "size_steps_filter": 0.45,
    "enviromental": ["GREEN", "YELLOW", "RED", "BLACK"],
    "products": ["1234124","12342454",...],
    "weights": {
            "best_fit": 65.0,
            "mass_fit": 5.0,
            "co2": 10.0,
            "cost": 20.0
        }
}
```
### Response syntax
```yaml
{
    "name": "Optimizer 1",
    "performance": {
        "best_fit": 98.0,
        "co2": 78.0,
        "mass_fit": 67.0,
        "cost": 89.0,
        "enviromental": 98
    } 
    "iterations": 560,
    "execution_time": 7.54,
    "products": [
        {
        "id": "1234124",
        "sacks": 10
        },{
            ...
        }
    ],
    "cumulative": [0, 78, 100],
    "distribution": [0.1,0.05,0.5,0.35]
}
```
## Get optimal bridge
Returns the cumulative optimal bridge based on bridging option and value. The options are maximum poresize, average poresize, or permeability. Response contains the cumulative percent bridge.
### Request syntax
```yaml
{
    "request": "BRIDGE",
    "option": "MAXIMUM_PORESIZE"|"AVERAGE_PORESIZE"|"PERMEABILITY",
    "value": 500
}
```
### Response syntax
```yaml
{
    "bridge": [10,30,50,80,100]
}
```
## Get size fractions
Get the list of size fractions.
### Request syntax
```yaml
{
    "request": "SIZE_FRACTIONS"
}
```
### Response syntax
```yaml
{
    "size_fractions": [0.1,1,35,3500]
}
```













