import client from "./lib/apollo";
import TaskList from "./pages/index";
import TaskEditPage from "./pages/TaskEditPage";
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
          <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
