import styled from "styled-components";

export const MainContainer = styled.div`
  padding: 20px;
  margin: 0 auto;
  max-width: 680px;
`;

export const PageTitle = styled.h1`
  margin: 0 0 8px;
`;

export const SecondaryContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  border: solid 1px #6200ee;
`;

export const NoTasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  img {
    width: 200px;
    opacity: 0.7;
  }
`;
