import styled from "styled-components";

export const FlexColumnContainer = styled.div<{ $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => $align ?? "flex-start"};
  gap: 12px;
`;

export const Input = styled.input`
  background: var(--color-background);
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px var(--color-primary);
`;

export const TextArea = styled.textarea`
  background: var(--color-background);
  resize: vertical;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  border: solid 1px var(--color-primary);
`;

export const Select = styled.select`
  background: var(--color-surface);
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px var(--color-primary);
`;

export const ErrorText = styled.p`
  margin: 0;
  color: var(--color-danger);
  font-size: 0.875rem;
`;

export const HintText = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.813rem;
`;
