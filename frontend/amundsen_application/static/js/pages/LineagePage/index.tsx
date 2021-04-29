// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Link } from 'react-router-dom';
import * as DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router';

import { getTableLineage } from 'ducks/tableMetadata/reducer';
import { GetTableLineageRequest } from 'ducks/tableMetadata/types';

import { ResourceType, Lineage } from 'interfaces';

import { getSourceIconClass } from 'config/config-utils';

import { getLoggingParams } from 'utils/logUtils';

import { GlobalState } from 'ducks/rootReducer';
import LoadingSpinner from 'components/LoadingSpinner';
import Breadcrumb from 'components/Breadcrumb';

import './styles.scss';

import { getLink } from 'components/ResourceListItem/TableListItem';
import Tree from 'react-d3-tree';
import { ForceGraph2D } from 'react-force-graph';
import * as Constants from './constants';
// import {logClick} from "../../utils/analytics";

const SERVER_ERROR_CODE = 500;

export interface PropsFromState {
  // isLoading: boolean;
  // isLoadingDashboards: boolean;
  // numRelatedDashboards: number;
  statusCode: number | null;
  // tableData: TableMetadata;
  tableLineage: Lineage;
}
export interface DispatchFromProps {
  // getTableData: (
  //   key: string,
  //   searchIndex?: string,
  //   source?: string
  // ) => GetTableDataRequest;
  getTableLineageDispatch: (key: string) => GetTableLineageRequest;
  // openRequestDescriptionDialog: (
  //   requestMetadataType: RequestMetadataType,
  //   columnName: string
  // ) => OpenRequestAction;
  // searchSchema: (schemaText: string) => UpdateSearchStateRequest;
}

export interface MatchProps {
  cluster: string;
  database: string;
  schema: string;
  table: string;
}

export type LineageProps = PropsFromState &
  DispatchFromProps &
  RouteComponentProps<MatchProps>;

const ErrorMessage = () => (
  <div className="container error-label">
    <Breadcrumb />
    <label>{Constants.ERROR_MESSAGE}</label>
  </div>
);

export class LineagePage extends React.Component<
  LineageProps & RouteComponentProps<any>
> {
  private key: string;

  state: any = {};

  private treeContainerRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { getTableLineageDispatch } = this.props;
    this.key = this.getTableKey();
    getTableLineageDispatch(this.key);

    // Centering the graph
    if (this.treeContainerRef.current) {
      const dimensions = this.treeContainerRef.current!.getBoundingClientRect();
      this.setState({
        treeTranslate: {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
        },
      });
    }
  }

  componentDidUpdate() {
    const { getTableLineageDispatch } = this.props;
    const newKey = this.getTableKey();
    if (this.key !== newKey) {
      this.key = newKey;
      getTableLineageDispatch(this.key);
    }
  }

  getDisplayName() {
    const { match } = this.props;
    const { params } = match;

    return `Lineage Information | ${params.schema}.${params.table}`;
  }

  // ToDo: Should be moved to a common place
  getTableKey() {
    /*
    This 'key' is the `table_uri` format described in metadataservice. Because it contains the '/' character,
    we can't pass it as a single URL parameter without encodeURIComponent which makes ugly URLs.
    DO NOT CHANGE
    */
    const { match } = this.props;
    const { params } = match;

    return `${params.database}://${params.cluster}.${params.schema}/${params.table}`;
  }

  handleClick = (e) => {
    console.log(e);
  };

  getDownstreamEntities() {
    const { tableLineage } = this.props;
    const data: { name: string; children: any[] } = {
      name: this.getTableKey(),
      children: [],
    };
    Object.keys(tableLineage.downstream_entities).map((key, index) => {
      const item = tableLineage.downstream_entities[key];
      data.children.push({ name: item.name });
    });
    return data;
  }

  getUpstreamEntities() {
    const { tableLineage } = this.props;
    const data: { name: string; children: any[] } = {
      name: this.getTableKey(),
      children: [],
    };
    Object.keys(tableLineage.upstream_entities).map((key, index) => {
      const item = tableLineage.upstream_entities[key];
      data.children.push({ name: item.name });
    });
    return data;
  }

  render() {
    // const { isLoading, statusCode, tableData } = this.props;
    const { match, tableLineage, statusCode } = this.props;
    const tableLineageHardCoded = {
      downstream_entities: [
        {
          badges: [
            {
              badge_name: 'certified',
              category: 'table_status',
            },
            {
              badge_name: 'alpha',
              category: 'table_status',
            },
            {
              badge_name: 'beta',
              category: 'table_status',
            },
          ],
          cluster: 'ca_covid',
          database: 'snowflake',
          key: 'snowflake://ca_covid.open_data/statewide_testing',
          level: 1,
          name: 'statewide_testing',
          schema: 'open_data',
          source: 'snowflake',
          usage: 4573,
        },
      ],
      upstream_entities: [
        {
          badges: [
            {
              badge_name: 'certified',
              category: 'table_status',
            },
          ],
          cluster: 'ca_covid',
          database: 'snowflake',
          key: 'snowflake://ca_covid.open_data/case_demographics_sex',
          level: 1,
          name: 'case_demographics_sex',
          schema: 'open_data',
          source: 'snowflake',
          usage: 20,
        },
        {
          badges: [
            {
              badge_name: 'beta',
              category: 'table_status',
            },
            {
              badge_name: 'npi',
              category: 'table_status',
            },
          ],
          cluster: 'ca_covid',
          database: 'snowflake',
          key: 'snowflake://ca_covid.open_data/case_demographics_ethnicity',
          level: 1,
          name: 'case_demographics_ethnicity',
          schema: 'open_data',
          source: 'snowflake',
          usage: 110,
        },
        {
          badges: [
            {
              badge_name: 'prod',
              category: 'table_status',
            },
            {
              badge_name: 'certified',
              category: 'table_status',
            },
            {
              badge_name: 'alpha',
              category: 'table_status',
            },
            {
              badge_name: 'beta',
              category: 'table_status',
            },
          ],
          cluster: 'ca_covid',
          database: 'snowflake',
          key: 'snowflake://ca_covid.open_data/case_demographics_age',
          level: 1,
          name: 'case_demographics_age',
          schema: 'open_data',
          source: 'snowflake',
          usage: 2184,
        },
      ],
    };

    const currentNode = {
      badges: [],
      cluster: 'ca_covid',
      database: 'snowflake',
      key: 'snowflake://ca_covid.open_data/statewide_cases',
      level: 0,
      name: 'statewide_cases',
      schema: 'open_data',
      source: 'snowflake',
      usage: 20,
    };

    const data = tableLineageHardCoded.upstream_entities.concat(
      tableLineageHardCoded.downstream_entities,
      [currentNode]
    );

    const links = [
      {
        source: 'snowflake://ca_covid.open_data/statewide_cases',
        target: 'snowflake://ca_covid.open_data/statewide_testing',
        direction: 'downstream',
      },
      {
        target: 'snowflake://ca_covid.open_data/statewide_cases',
        source: 'snowflake://ca_covid.open_data/case_demographics_sex',
        direction: 'upstream',
      },
      {
        target: 'snowflake://ca_covid.open_data/statewide_cases',
        source: 'snowflake://ca_covid.open_data/case_demographics_age',
        direction: 'upstream',
      },
      {
        target: 'snowflake://ca_covid.open_data/statewide_cases',
        source: 'snowflake://ca_covid.open_data/case_demographics_ethnicity',
        direction: 'upstream',
      },
    ];

    const containerStyles = {
      width: '100%',
      height: '100vh',
    };
    const { params } = match;
    let innerContent;

    // We want to avoid rendering the previous table's metadata before new data is fetched in componentDidMount
    if (statusCode === SERVER_ERROR_CODE) {
      innerContent = <ErrorMessage />;
    } else {
      const resourceData = {
        database: params.database,
        schema: params.schema,
        name: params.table,
        cluster: params.cluster,
      };
      innerContent = (
        <div className="resource-detail-layout lineage-page">
          <header className="resource-header">
            <div className="header-section">
              <span
                className={
                  'icon icon-header ' +
                  getSourceIconClass(resourceData.database, ResourceType.table)
                }
              />
            </div>
            <div className="header-section header-title">
              <h1
                className="header-title-text truncated"
                title={`${resourceData.schema}.${resourceData.name}`}
              >
                <Link to="/search" onClick={this.handleClick}>
                  {resourceData.schema}
                </Link>
                .{resourceData.name}
                <span className="text-secondary lineage-graph-label">
                  Lineage Graph
                </span>
              </h1>
              <div className="body-2">
                <Link
                  className="resource-list-item table-list-item"
                  to={getLink(resourceData, 'table-lineage-page')}
                >
                  Back to table details
                </Link>
              </div>
            </div>
            <div className="header-section header-links">Cancel</div>
          </header>
          <div className="row">
            <div
              className="lineage-charts"
              style={containerStyles}
              ref={this.treeContainerRef}
            >
              {/* TRY 1 */}
              <div
                id="#treeWrapper"
                style={containerStyles}
                ref={this.treeContainerRef}
              >
                <Tree
                  data={this.getUpstreamEntities()}
                  depthFactor={-200}
                  orientation="vertical"
                  translate={this.state.treeTranslate}
                />
              </div>
              <div
                id="#treeWrapper2"
                style={containerStyles}
                ref={this.treeContainerRef}
              >
                <Tree
                  data={this.getDownstreamEntities()}
                  orientation="vertical"
                  translate={this.state.treeTranslate}
                />
              </div>

              {/* TRY 2 */}
              {/* <ForceGraph2D*/}
              {/*    graphData={{nodes: data, links: links}}*/}
              {/*    nodeId='key'*/}
              {/*    dagMode='lr'*/}
              {/*    dagLevelDistance={20}*/}
              {/*    cooldownTicks={0}*/}
              {/*    linkWidth={2}*/}
              {/*    linkDirectionalParticles={5}*/}
              {/*    linkDirectionalParticleSpeed={0.001}*/}
              {/*    nodeLabel={d => d.name}*/}
              {/*    ref={this.treeContainerRef}*/}
              {/*    // onEngineStop={() => this.treeContainerRef.current && this.treeContainerRef.current.zoomToFit(900)}*/}
              {/*/ >*/}
            </div>
          </div>
        </div>
      );
    }

    return (
      <DocumentTitle
        title={`${this.getDisplayName()} - Amundsen Table Details`}
      >
        {innerContent}
      </DocumentTitle>
    );
  }
}

export const mapStateToProps = (state: GlobalState) => ({
  // isLoading: state.tableMetadata.isLoading,
  // statusCode: state.tableMetadata.statusCode,
  statusCode: state.tableMetadata.tableLineage.status,
  // tableData: state.tableMetadata.tableData,
  tableLineage: state.tableMetadata.tableLineage.lineage,
  // numRelatedDashboards: state.tableMetadata.dashboards
  //   ? state.tableMetadata.dashboards.dashboards.length
  //   : 0,
  // isLoadingDashboards: state.tableMetadata.dashboards
  //   ? state.tableMetadata.dashboards.isLoading
  //   : true,
});

export const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      // getTableData,
      getTableLineageDispatch: getTableLineage,
      // openRequestDescriptionDialog,
      // searchSchema: (schemaText: string) =>
      //   updateSearchState({
      //     filters: {
      //       [ResourceType.table]: { schema: schemaText },
      //     },
      //     submitSearch: true,
      //   }),
    },
    dispatch
  );

export default connect<PropsFromState, DispatchFromProps>(
  mapStateToProps,
  mapDispatchToProps
)(LineagePage);
