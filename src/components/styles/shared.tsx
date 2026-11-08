import styled from "styled-components";
import { penCursor } from "../../assets";

// Also rendered as a router Link, so no :enabled selectors.
export const Button = styled.button`
  cursor: pointer;
  color: #6200ee;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  border: solid 1px #6200ee;

  &:disabled {
    color: #fff;
    background: #6c757d;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #6200ee;
    color: #fff;
    cursor: url(${penCursor}), pointer;
  }
`;

export const VisuallyHiddenLabel = styled.label`
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  clip-path: inset(50%);
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
