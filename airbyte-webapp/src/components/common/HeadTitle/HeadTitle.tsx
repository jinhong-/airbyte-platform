import React from "react";
import { Helmet } from "react-helmet-async";
import { useIntl } from "react-intl";

import { useLocalStorage } from "core/utils/useLocalStorage";
import { useCurrentWorkspace } from "hooks/services/useWorkspace";

const AIRBYTE = "Airbyte";
const SEPARATOR = "|";

interface FormattedHeadTitle {
  id: string;
  values?: Record<string, string>;
}

interface StringHeadTitle {
  title: string;
}

type HeadTitleDefinition = FormattedHeadTitle | StringHeadTitle;

const isStringTitle = (v: HeadTitleDefinition): v is StringHeadTitle => {
  return "title" in v;
};

interface HeadTitleProps {
  titles: HeadTitleDefinition[];
}

interface WorkspacePrefixedTitleProps {
  title: string;
}

const WorkspacePrefixedTitle: React.FC<WorkspacePrefixedTitleProps> = ({ title }) => {
  const workspace = useCurrentWorkspace();

  return (
    <Helmet
      titleTemplate={`${workspace.name} ${SEPARATOR} ${AIRBYTE} ${SEPARATOR} %s`}
      defaultTitle={`${workspace.name} ${SEPARATOR} ${AIRBYTE}`}
    >
      <title>{title}</title>
    </Helmet>
  );
};

/**
 * Titles defined by {@link HeadTitleDefinition} will be
 * chained together with the {@link SEPARATOR}.
 */
export const HeadTitle: React.FC<HeadTitleProps> = ({ titles }) => {
  const intl = useIntl();
  const [prefixWithWorkspace] = useLocalStorage("airbyte_workspace-in-title", false);

  const getTitle = (d: HeadTitleDefinition): string => {
    return isStringTitle(d) ? d.title : intl.formatMessage({ id: d.id }, d.values);
  };

  const headTitle = titles.map(getTitle).join(` ${SEPARATOR} `);

  if (prefixWithWorkspace) {
    return <WorkspacePrefixedTitle title={headTitle} />;
  }

  return (
    <Helmet titleTemplate={`${AIRBYTE} ${SEPARATOR} %s`} defaultTitle={AIRBYTE}>
      <title>{headTitle}</title>
    </Helmet>
  );
};
