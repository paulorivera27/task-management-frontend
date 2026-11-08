import styled from "styled-components";
import { penCursor } from "../../assets";

// Also rendered as a router Link, so no :enabled selectors.
export const Button = styled.button`
  cursor: pointer;
  color: var(--color-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  background: var(--color-background);
  border: solid 1px var(--color-primary);

  &:disabled {
    color: var(--color-surface);
    background: var(--color-disabled);
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-surface);
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

// Used for filters and pagination; the active one is filled.
export const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 4px;
  border: solid 1px var(--color-primary);
  color: ${({ $active }) =>
    $active ? "var(--color-surface)" : "var(--color-primary)"};
  background: ${({ $active }) =>
    $active ? "var(--color-primary)" : "var(--color-surface)"};

  &:hover {
    cursor: url(${penCursor}), pointer;
  }
`;

export const FlexRowContainer = styled.div<{
  $justify?: string;
  $alignItems?: string;
}>`
  gap: 12px;
  display: flex;
  align-items: ${({ $alignItems }) => $alignItems ?? "center"};
  justify-content: ${({ $justify }) => $justify ?? "flex-start"};
`;
