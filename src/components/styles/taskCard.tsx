import styled from "styled-components";

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
