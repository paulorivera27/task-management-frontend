import client from "./lib/apollo";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ApolloProvider } from "@apollo/client/react";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingComponent from "./components/LoadingComponent";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const TaskList = lazy(() => import("./pages/index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const TaskEditPage = lazy(() => import("./pages/TaskEditPage"));
const TaskCreatePage = lazy(() => import("./pages/TaskCreatePage"));

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingComponent />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskCreatePage />} />
                <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
