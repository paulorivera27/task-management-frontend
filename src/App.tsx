import client from "./lib/apollo";
import TaskList from "./pages/index";
import LoginPage from "./pages/LoginPage";
import TaskEditPage from "./pages/TaskEditPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import { AuthProvider } from "./context/AuthContext";
import { ApolloProvider } from "@apollo/client/react";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<TaskList />} />
              <Route path="/tasks/new" element={<TaskCreatePage />} />
              <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
