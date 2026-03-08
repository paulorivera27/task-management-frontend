import styled from "styled-components";

export const FlexColumnContainer = styled.div<{ $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => $align ?? "flex-start"};
  gap: 12px;
`;

export const Input = styled.input`
  outline: none;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px #6200ee;

  &:focus {
    border-color: #6200ee;
    box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.15);
  }
`;

export const TextArea = styled.textarea`
  outline: none;
  resize: vertical;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  border: solid 1px #6200ee;

  &:focus {
    border-color: #6200ee;
    box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.15);
  }
`;

export const Select = styled.select`
  outline: none;
  background: #fff;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  border: solid 1px #6200ee;

  &:focus {
    border-color: #6200ee;
    box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.15);
  }
`;

export const ErrorText = styled.p`
  margin: 0;
  color: #d32f2f;
  font-size: 0.875rem;
`;
