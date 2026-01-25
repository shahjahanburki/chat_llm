from fastapi import FastAPI 
from app.routes.agent import router as agent_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # React can talk to FastAPI
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router)

@app.get('/health')
def health():
    return {"status" : "Ok"}

