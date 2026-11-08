import styled from "styled-components";
import { statusColors } from "../../theme";
import type { TaskStatus } from "../../types";

export const CardTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 1.17rem;
`;

export const Card = styled.article`
  padding: 16px;
  background: var(--color-surface);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid var(--color-primary);
  box-shadow: 10px 10px 5px rgba(49, 0, 150, 0.25);
`;

export const Description = styled.p`
  margin: 0 0 8px;
`;

export const StatusBadge = styled.span<{ $status: TaskStatus }>`
  font-weight: 600;
  padding: 2px 8px;
  text-transform: uppercase;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
  color: ${({ $status }) => statusColors[$status].color};
  background: ${({ $status }) => statusColors[$status].background};
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;
