/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { Link, Note, getTabPanelId } from 'design-system';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '../../../components/common/DocumentationLink';
import { getBranchLikeQuery } from '../../../helpers/branch-like';
import { translate } from '../../../helpers/l10n';
import { getBaseUrl } from '../../../helpers/system';
import { CodeScope, queryToSearch } from '../../../helpers/urls';
import { Branch } from '../../../types/branch-like';
import { ComponentQualifier } from '../../../types/component';
import { NewCodeDefinitionType } from '../../../types/new-code-definition';
import { Component, Period } from '../../../types/types';

export interface MeasuresPanelNoNewCodeProps {
  branch?: Branch;
  component: Component;
  period?: Period;
}

export default function MeasuresPanelNoNewCode(props: MeasuresPanelNoNewCodeProps) {
  const { branch, component, period } = props;

  const isApp = component.qualifier === ComponentQualifier.Application;

  const hasBadReferenceBranch =
    !isApp && !!period && !period.date && period.mode === NewCodeDefinitionType.ReferenceBranch;
  /*
   * If the period is "reference branch"-based, and if there's no date, it means
   * that we're not lacking a second analysis, but that we'll never have new code because the
   * selected reference branch is itself, or has disappeared for some reason.
   * Makes no sense for Apps (project aggregate)
   */
  const hasBadNewCodeSettingSameRef = hasBadReferenceBranch && branch?.name === period?.parameter;

  const badExplanationKey = hasBadReferenceBranch
    ? hasBadNewCodeSettingSameRef
      ? 'overview.measures.same_reference.explanation'
      : 'overview.measures.bad_reference.explanation'
    : 'overview.measures.empty_explanation';

  const showSettingsLink = !!(component.configuration && component.configuration.showSettings);

  return (
    <div
      className="sw-flex sw-items-center sw-justify-center"
      id={getTabPanelId(CodeScope.New)}
      style={{ height: 500 }}
    >
      <img
        alt="" /* Make screen readers ignore this image; it's purely eye candy. */
        className="sw-mr-2"
        height={52}
        src={`${getBaseUrl()}/images/source-code.svg`}
      />
      <Note as="div" className="sw-ml-4 sw-max-w-abs-500">
        <p className="sw-mb-2 sw-mt-4">{translate(badExplanationKey)}</p>
        {hasBadNewCodeSettingSameRef ? (
          showSettingsLink && (
            <p>
              <FormattedMessage
                defaultMessage={translate('overview.measures.bad_setting.link')}
                id="overview.measures.bad_setting.link"
                values={{
                  setting_link: (
                    <Link
                      to={{
                        pathname: '/project/baseline',
                        search: queryToSearch({ id: component.key, ...getBranchLikeQuery(branch) }),
                      }}
                    >
                      {translate('settings.new_code_period.category')}
                    </Link>
                  ),
                }}
              />
            </p>
          )
        ) : (
          <p>
            <FormattedMessage
              defaultMessage={translate('overview.measures.empty_link')}
              id="overview.measures.empty_link"
              values={{
                learn_more_link: (
                  <DocumentationLink to="/user-guide/clean-as-you-code/">
                    {translate('learn_more')}
                  </DocumentationLink>
                ),
              }}
            />
          </p>
        )}
      </Note>
    </div>
  );
}
