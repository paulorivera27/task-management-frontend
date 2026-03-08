import styled from "styled-components";
import { penCursor } from "../../assets";

export const PaginationContainer = styled.div`
  gap: 8px;
  margin: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export const PaginationButton = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 4px;
  border: solid 1px #6200ee;
  color: ${({ $active }) => ($active ? "#fff" : "#6200ee")};
  background: ${({ $active }) => ($active ? "#6200ee" : "#fff")};

  &:hover {
    cursor: url(${penCursor}), pointer;
  }
`;
