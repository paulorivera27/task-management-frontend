import styled from "styled-components";
import { penCursor } from "../../assets";

// From here i added the task list styles.
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

// end of task list styles.

// start of the task card styles.

export const CardTitle = styled.h3`
  margin: 0 0 8px;
  background: #fff;
`;

export const Card = styled.div`
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #6200ee;
  box-shadow: 10px 10px 5px rgba(49, 0, 150, 0.25);
`;

export const Description = styled.p`
  margin: 0 0 8px;
  background: #fff;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
  color: ${({ $status }) =>
    $status === "COMPLETED"
      ? "#155724"
      : $status === "IN_PROGRESS"
        ? "#856404"
        : "#383d41"};
  background: ${({ $status }) =>
    $status === "COMPLETED"
      ? "#d4edda"
      : $status === "IN_PROGRESS"
        ? "#fff3cd"
        : "#e2e3e5"};
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  background: #fff;
`;

export const Button = styled.button`
  cursor: pointer;
  color: #6200ee;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px #6200ee;

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  &:enabled:hover {
    background: #6200ee;
    color: #fff;
    cursor: url(${penCursor}), pointer;
  }
`;

export const FlexRowContainer = styled.div<{ $justify?: string }>`
  gap: 12px;
  display: flex;
  background: #fff;
  align-items: center;
  justify-content: ${({ $justify }) => $justify ?? "flex-start"};
`;

// end of the task card styles.

// start of the task filter styles.

export const FilterBar = styled.div`
  gap: 8px;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 4px;
  border: solid 1px #6200ee;
  color: ${({ $active }) => ($active ? "#fff" : "#6200ee")};
  background: ${({ $active }) => ($active ? "#6200ee" : "#fff")};

  &:hover {
    cursor: url(${penCursor}), pointer;
  }
`;

// end of the task filter styles.
