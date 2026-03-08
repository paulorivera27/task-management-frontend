import { useState } from "react";
import {
  PageTitle,
  MainContainer,
  SecondaryContainer,
} from "../components/styles/taskList";
import {
  Input,
  ErrorText,
  FlexColumnContainer,
} from "../components/styles/taskForm";
import {
  SignUpSignInBtn,
  SignUpSignInContainer,
} from "../components/styles/LoginPage";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@apollo/client/react";
import { Button } from "../components/styles/shared";
import type { SignInData, SignUpData } from "../types";
import { SIGN_IN, SIGN_UP } from "../graphql/mutations";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [signIn, { loading: signingIn }] = useMutation<SignInData>(SIGN_IN);
  const [signUp, { loading: signingUp }] = useMutation<SignUpData>(SIGN_UP);

  const loading = signingIn || signingUp;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (isSignUp) {
        const { data } = await signUp({ variables: { email, password } });
        const payload = data?.signUp;

        if (payload?.errors?.length) {
          setFormError(payload.errors.join(", "));
          return;
        }

        if (payload?.token && payload?.user) {
          login(payload.token, payload.user);
        }
      } else {
        const { data } = await signIn({ variables: { email, password } });
        const payload = data?.signIn;

        if (payload?.errors?.length) {
          setFormError(payload.errors.join(", "));
          return;
        }

        if (payload?.token && payload?.user) {
          login(payload.token, payload.user);
        }
      }
    } catch {
      setFormError(t("auth.generic_error"));
    }
  };

  return (
    <MainContainer>
      <PageTitle>
        {isSignUp ? t("auth.sign_up_title") : t("auth.sign_in_title")}
      </PageTitle>

      <SecondaryContainer>
        <form onSubmit={handleSubmit}>
          <FlexColumnContainer $align="normal">
            <Input
              required
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email_placeholder")}
            />

            <Input
              required
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password_placeholder")}
            />

            <Button type="submit" disabled={loading}>
              {loading
                ? t("auth.loading")
                : isSignUp
                  ? t("auth.sign_up_button")
                  : t("auth.sign_in_button")}
            </Button>

            {formError && <ErrorText>{formError}</ErrorText>}
          </FlexColumnContainer>
        </form>
      </SecondaryContainer>

      <SignUpSignInContainer>
        {isSignUp ? t("auth.has_account") : t("auth.no_account")}{" "}
        <SignUpSignInBtn
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setFormError(null);
          }}
        >
          {isSignUp ? t("auth.sign_in_link") : t("auth.sign_up_link")}
        </SignUpSignInBtn>
      </SignUpSignInContainer>
    </MainContainer>
  );
}
