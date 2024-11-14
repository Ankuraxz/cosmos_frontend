require('dotenv').config(); // Ensure you load environment variables from .env file
const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');
const os = require('os');  // Import the os module for other potential uses

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the "public" directory

// Retrieve the Cosmos DB connection string from the environment
const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING;

if (!cosmosConnectionString) {
    console.error('COSMOS_CONNECTION_STRING is not defined in the environment variables');
    process.exit(1);  // Exit the application if no connection string is found
}

// Initialize Cosmos Client using the environment-based connection string
const client = new CosmosClient(cosmosConnectionString);

// Reference to the specific database and container
const database = client.database('iotsensorbackup');
const container = database.container('sensordata');

// Define GET endpoint to fetch all data, sorted by _ts (descending)
app.get('/data', async (req, res) => {
    try {
        // Query for all records, sorted by _ts in descending order
        const { resources: allResults } = await container.items.query('SELECT * FROM c ORDER BY c._ts DESC').fetchAll();

        // Send all data as response
        res.json(allResults);
    } catch (error) {
        console.error('Error fetching data from Cosmos DB', error);
        res.status(500).send('Failed to retrieve data');
    }
});

// Start the server on port 3000 (or custom port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
