import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendRequest = async () => {
    const res = await fetch("http://127.0.0.1:8000/agent/planner", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({user_input: input})
    });

    const data = await res.json();
    setResponse(data.result);
  };

  return (
    <div style = {{ padding: 40 }}>
      <h2>Agentic AI</h2>
      <textarea 
      rows={4}
      value={input}
      onChange={(e) => setInput(e.target.value)}/>
      <br />
      <button onClick={sendRequest}>Send</button>
      <pre>{response}</pre>
    </div>
  );
}

export default App;