import styled from "styled-components";
import { penCursor } from "../../assets";

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

export const FlexRowContainer = styled.div<{
  $justify?: string;
  $alignItems?: string;
  $background?: string;
}>`
  gap: 12px;
  display: flex;
  background: ${({ $background }) => $background ?? "#fff"};
  align-items: ${({ $alignItems }) => $alignItems ?? "center"};
  justify-content: ${({ $justify }) => $justify ?? "flex-start"};
`;
