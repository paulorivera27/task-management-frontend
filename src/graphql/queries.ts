import { gql } from "@apollo/client";

export const GET_TASKS = gql`
  query GetTasks($status: TaskStatusEnum, $limit: Int, $offset: Int) {
    tasks(status: $status, limit: $limit, offset: $offset) {
      tasks {
        id
        title
        status
        description
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      createdAt
      updatedAt
    }
  }
`;
