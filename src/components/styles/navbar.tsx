import styled from "styled-components";

export const Nav = styled.nav`
  gap: 12px;
  display: flex;
  padding: 12px 20px;
  align-items: center;
  justify-content: flex-end;
  border-bottom: solid 1px #e0e0e0;
`;

export const UserEmail = styled.span`
  color: #555;
  margin-right: auto;
  font-size: 0.875rem;
`;

export const LanguageSelect = styled.select`
  cursor: pointer;
  color: #6200ee;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fff;
  font-size: 0.813rem;
  border: solid 1px #6200ee;
`;

export const LogoutButton = styled.button`
  cursor: pointer;
  color: #d32f2f;
  background: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.813rem;
  border: solid 1px #d32f2f;

  &:hover {
    background: #d32f2f;
    color: #fff;
  }
`;
