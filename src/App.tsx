import client from './lib/apollo';
import TaskList from './components/TaskList';
import { ApolloProvider } from "@apollo/client/react";

function App() {
  return (
    <ApolloProvider client={client}>
      <TaskList />
    </ApolloProvider>
  );
}

export default App;