import client from "./lib/apollo";
import TaskList from "./pages/index";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskList />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
