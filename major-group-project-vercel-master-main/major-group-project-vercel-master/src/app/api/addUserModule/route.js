
export async function POST(req, res) {
    const { MongoClient, ObjectId } = require('mongodb');
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const client = new MongoClient(url);
    const dbName = 'forums';
    
    if (req.method === 'POST') {
    
    
        try {
          // Destructure the data sent in the request body
          const { moduleId, moduleYear, moduleCode, moduleTitle, username } = req.body;
    
          // Add the module to the user_modules collection
          const userModule = {
            moduleId,
            moduleYear,
            moduleCode,
            moduleTitle,
            username,
          };
          await client.connect();
          const db = client.db(dbName);
          // Insert the document into the user_modules collection
          const result = await db.collection('user_modules').insertOne(userModule);
    
          if (result.acknowledged) {
            // Successfully added the module
            res.status(200).json({ message: 'Module added successfully', data: result });
          } else {
            // Handle the case where the module wasn't added successfully
            res.status(400).json({ message: 'Failed to add the module' });
          }
        } catch (error) {
          console.error('Error in /api/addUserModule:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  