import { gql } from "@apollo/client";

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $description: String
    $status: TaskStatusEnum
  ) {
    createTask(
      input: { title: $title, description: $description, status: $status }
    ) {
      task {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $status: TaskStatusEnum
  ) {
    updateTask(
      input: {
        id: $id
        title: $title
        description: $description
        status: $status
      }
    ) {
      task {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(input: { id: $id }) {
      id
      errors
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
      }
      errors
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
      }
      errors
    }
  }
`;
