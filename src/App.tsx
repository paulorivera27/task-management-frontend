import client from "./lib/apollo";
import TaskList from "./pages/index";
import TaskCreatePage from "./pages/TaskCreatePage";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskCreatePage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
