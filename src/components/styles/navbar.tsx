import styled from "styled-components";

export const Nav = styled.nav`
  gap: 12px;
  display: flex;
  padding: 12px 20px;
  align-items: center;
  justify-content: flex-end;
  border-bottom: solid 1px var(--color-border);
`;

export const UserEmail = styled.span`
  color: var(--color-text-muted);
  margin-right: auto;
  font-size: 0.875rem;
`;

export const LanguageSelect = styled.select`
  cursor: pointer;
  color: var(--color-primary);
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--color-surface);
  font-size: 0.813rem;
  border: solid 1px var(--color-primary);
`;

export const LogoutButton = styled.button`
  cursor: pointer;
  color: var(--color-danger);
  background: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.813rem;
  border: solid 1px var(--color-danger);

  &:hover {
    background: var(--color-danger);
    color: var(--color-surface);
  }
`;
