import React from 'react';
import { get, keyBy } from 'lodash';
import { Button } from 'antd';
import moment from 'moment';
import { Assignment } from '../../ducks/assignments';
import type { TFunction } from '@opensrp/i18n';
import { TableData } from '.';
import { TableColumnsNamespace } from '../../constants';
import { Column } from '@opensrp/react-utils';

/**
 * component rendered in the action column of the table
 *
 * @param t - translator function
 */
export const ActionsColumnCustomRender =
  (t: TFunction): Column<TableData>['render'] =>
  // eslint-disable-next-line react/display-name
  (record) => {
    return (
      <>
        <Button
          type="link"
          style={{ padding: '4px 0px' }}
          onClick={() => {
            record.setModalVisibility(true);
            record.setExistingAssignments(record.existingAssignments);
            record.setAssignedLocAndTeams({
              locationName: record.locationName,
              jurisdictionId: record.id,
              assignedTeams: record.assignedTeamIds,
            });
          }}
        >
          {t('Edit')}
        </Button>
      </>
    );
  };

/**
 * team assignment table columns factory
 *
 * @param t -  the translator function lookup
 */
export const columnsFactory = (t: TFunction): Column<TableData>[] => {
  const columns: Column<TableData>[] = [
    {
      title: t('Name'),
      dataIndex: 'locationName',
      key: `${TableColumnsNamespace}-locationName` as keyof TableData,
      defaultSortOrder: 'descend',
      sorter: (rec1, rec2) => {
        if (rec1.locationName > rec2.locationName) {
          return -1;
        } else if (rec1.locationName < rec2.locationName) {
          return 1;
        } else {
          return 0;
        }
      },
    },
    {
      title: t('Assigned Teams'),
      dataIndex: 'assignedTeams',
      key: `${TableColumnsNamespace}-assignedTeams` as keyof TableData,
    },
  ];

  return columns;
};

/**
 * Get assignments payload
 *
 * Takes values from the team assignment edit form and generates a payload
 * of assignments ready to be sent to the OpenSRP API.
 *
 * @param {string[]} selectedOrgs - an array of the selected organization ids
 * @param {string} selectedPlanId - the selected plan definition object
 * @param {string} selectedJurisdictionId - the selected OpenSRP jurisdiction
 * @param {string[]} initialOrgs - an array of initial (existing) organization ids
 * @param {Assignment[]} existingAssignments - an array of Assignment objects that exist for this plan/jurisdiction
 * @returns {Assignment[]} - returns payload array to be POSTed
 */
export const getPayload = (
  selectedOrgs: string[],
  selectedPlanId: string,
  selectedJurisdictionId: string,
  initialOrgs: string[] = [],
  existingAssignments: Assignment[] = []
): Assignment[] => {
  const now = moment(new Date());
  let startDate = now.format();
  const endDate = now.add(10, 'year').format();

  const payload: Assignment[] = [];
  const assignmentsByOrgId = keyBy(existingAssignments, 'organization');

  for (const orgId of selectedOrgs) {
    if (!payload.map((obj) => obj.organization).includes(orgId)) {
      if (initialOrgs.includes(orgId)) {
        // we should not change the fromDate, ever (the API will reject it)
        const thisAssignment = get(assignmentsByOrgId, orgId);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (thisAssignment) {
          startDate = thisAssignment.fromDate;
        }
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdictionId,
        organization: orgId,
        plan: selectedPlanId,
        toDate: endDate, // set a future date of 10 years
      });
    }
  }

  // turns out if you put it in the loop it keeps subtracting a day for every iteration
  const retireDate = moment(new Date()).format();

  for (const retiredOrgId of initialOrgs.filter((orgId) => !selectedOrgs.includes(orgId))) {
    if (!payload.map((obj) => obj.organization).includes(retiredOrgId)) {
      // we should not change the fromDate, ever (the API will reject it)
      const thisAssignment = get(assignmentsByOrgId, retiredOrgId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (thisAssignment) {
        startDate = thisAssignment.fromDate;
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdictionId,
        organization: retiredOrgId,
        plan: selectedPlanId,
        toDate: retireDate,
      });
    }
  }
  return payload;
};
