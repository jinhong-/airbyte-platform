import { faComments, faLightbulb } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import { useFormState, useWatch } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";

import { Form, FormControl } from "components/forms";
import { FormSubmissionHandler } from "components/forms/Form";
import { Box } from "components/ui/Box";
import { Button } from "components/ui/Button";
import { FlexContainer, FlexItem } from "components/ui/Flex";
import { Heading } from "components/ui/Heading";
import { Link } from "components/ui/Link";
import { Message } from "components/ui/Message";
import { Text } from "components/ui/Text";

import { links } from "core/utils/links";
import { CloudRoutes } from "packages/cloud/cloudRoutePaths";
import { useKeycloakService } from "packages/cloud/services/auth/KeycloakService";

import styles from "./SSOIdentifierPage.module.scss";

interface CompanyIdentifierValues {
  companyIdentifier: string;
}

const schema = yup.object().shape({
  companyIdentifier: yup.string().trim().required("form.empty.error"),
});

export const SSOIdentifierPage = () => {
  const { changeRealmAndRedirectToSignin, user, signoutRedirect } = useKeycloakService();
  const { formatMessage } = useIntl();

  const handleSubmit: FormSubmissionHandler<CompanyIdentifierValues> = async ({ companyIdentifier }, methods) => {
    try {
      return await changeRealmAndRedirectToSignin(companyIdentifier);
    } catch (e) {
      methods.setError("companyIdentifier", { message: "login.sso.invalidCompanyIdentifier" });
      return Promise.reject();
    }
  };

  return (
    <>
      <main className={styles.ssoIdentifierPage}>
        <Form<CompanyIdentifierValues>
          onSubmit={handleSubmit}
          defaultValues={{ companyIdentifier: "" }}
          schema={schema}
        >
          <Box mb="md">
            <Heading as="h1" size="xl" color="blue">
              <FormattedMessage id="login.sso.title" />
            </Heading>
          </Box>
          <Box mb="lg">
            <Text>
              <FormattedMessage id="login.sso.description" />
            </Text>
          </Box>
          <FormControl<CompanyIdentifierValues>
            fieldType="input"
            name="companyIdentifier"
            placeholder={formatMessage({ id: "login.sso.companyIdentifier.placeholder" })}
            label={formatMessage({ id: "login.sso.companyIdentifier.label" })}
          />
          <FormSubmissionButton />
          <Box my="xl">
            <BookmarkableUrl />
          </Box>
          <FlexContainer gap="md">
            <FlexItem grow={false}>
              <FontAwesomeIcon icon={faComments} size="xs" />
            </FlexItem>
            <Text>
              <FormattedMessage
                id="login.sso.getSsoLogin"
                values={{ a: (content: ReactNode) => <Link to={links.contactSales}>{content}</Link> }}
              />
            </Text>
          </FlexContainer>
        </Form>
        {/* Temporary way to log out, since we cannot create users and show the full UI yet */}
      </main>
      {user && (
        <Box mt="2xl">
          <Message
            type="info"
            text={`There is a current session with user.sub: ${user.profile.sub} and user.profile.preferred_username: ${user.profile.preferred_username}`}
            actionBtnText={<FormattedMessage id="settings.accountSettings.logoutText" />}
            onAction={() => signoutRedirect()}
          />
        </Box>
      )}
    </>
  );
};

const FormSubmissionButton = () => {
  const { isSubmitting } = useFormState<CompanyIdentifierValues>();

  return (
    <FlexContainer justifyContent="space-between" alignItems="center">
      <Link to={CloudRoutes.Login}>
        <Text color="grey">
          <FormattedMessage id="login.backLogin" />
        </Text>
      </Link>
      <Button type="submit" isLoading={isSubmitting}>
        <FormattedMessage id="login.sso.continueWithSSO" />
      </Button>
    </FlexContainer>
  );
};

const BookmarkableUrl = () => {
  const fieldValue = useWatch<CompanyIdentifierValues>({ name: "companyIdentifier" });
  const { formatMessage } = useIntl();
  const placeholder = formatMessage({ id: "login.sso.companyIdentifier.placeholder" });
  const companyHandle = fieldValue.trim() || placeholder;

  return (
    <FlexContainer gap="md">
      <FlexItem grow={false}>
        <FontAwesomeIcon icon={faLightbulb} size="xs" />
      </FlexItem>
      <Text>
        <FormattedMessage
          id="login.sso.quickLink"
          values={{
            a: (content: ReactNode) => <Link to={`${CloudRoutes.Sso}/${companyHandle}`}>{content}</Link>,
            companyIdentifier: companyHandle,
          }}
        />
      </Text>
    </FlexContainer>
  );
};
