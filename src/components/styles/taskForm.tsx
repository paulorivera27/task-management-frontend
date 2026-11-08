import styled from "styled-components";

export const FlexColumnContainer = styled.div<{ $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => $align ?? "flex-start"};
  gap: 12px;
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px #6200ee;
`;

export const TextArea = styled.textarea`
  resize: vertical;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  border: solid 1px #6200ee;
`;

export const Select = styled.select`
  background: #fff;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px #6200ee;
`;

export const ErrorText = styled.p`
  margin: 0;
  color: #d32f2f;
  font-size: 0.875rem;
`;

export const HintText = styled.p`
  margin: 0;
  color: #555;
  font-size: 0.813rem;
`;
