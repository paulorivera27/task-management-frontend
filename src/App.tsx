import client from './lib/apollo';
import { ApolloProvider } from "@apollo/client/react";

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Task Manager</h1>
        <p>Apollo Client connected. Ready to build.</p>
      </div>
    </ApolloProvider>
  );
}

export default App;