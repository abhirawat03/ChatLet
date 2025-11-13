import uvicorn 
import os 
from dotenv import load_dotenv

load_dotenv()

SERVER_HOST=os.getenv("SERVER_HOST")
SERVER_PORT=int(os.getenv("SERVER_PORT"))
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=SERVER_HOST,
        port=SERVER_PORT,
        reload=True
    )