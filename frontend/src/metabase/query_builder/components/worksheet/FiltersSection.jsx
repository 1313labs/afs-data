import React from "react";
import { t, jt } from "c-3po";

import Popover from "metabase/components/Popover";
import PopoverWithTrigger from "metabase/components/PopoverWithTrigger";
import Icon from "metabase/components/Icon";

import Filter from "../Filter";
import FilterPopover from "../filters/FilterPopover";
import FieldName from "../FieldName";

import WorksheetSection from "./WorksheetSection";

import Clause from "./Clause";
import ClauseDropTarget from "./dnd/ClauseDropTarget";
import DropTargetEmptyState from "./DropTargetEmptyState";
import AddClauseWidget from "./AddClauseWidget";
import AddClauseEmptyState from "./AddClauseEmptyState";

import SECTIONS from "./style";

const COLOR = SECTIONS.filter.color;

class FiltersSection extends React.Component {
  state = {
    newFilterDimension: null,
  };

  render() {
    const {
      query,
      setDatasetQuery,
      style,
      className,
      onClear,
      footerButtons,
      children,
    } = this.props;
    const { newFilterDimension } = this.state;
    const filters = query.filters();
    return (
      <WorksheetSection
        {...SECTIONS.filter}
        style={style}
        className={className}
        onClear={() => {
          query.clearFilters().update(setDatasetQuery);
          onClear();
        }}
        footerButtons={footerButtons}
      >
        <ClauseDropTarget
          color={COLOR}
          canDrop={dimension => {
            return dimension.operators().length > 0;
          }}
          onDrop={dimension => {
            this.setState({ newFilterDimension: dimension });
          }}
        >
          {filters.length > 0 ? (
            filters
              .map((filter, index) => (
                <FilterWidget
                  filter={filter}
                  index={index}
                  query={query}
                  setDatasetQuery={setDatasetQuery}
                />
              ))
              .concat(
                query.canAddFilter() && (
                  <AddClauseWidget color={COLOR}>
                    <FilterPopover
                      query={query}
                      onCommitFilter={filter =>
                        query.addFilter(filter).update(setDatasetQuery)
                      }
                    />
                  </AddClauseWidget>
                ),
              )
          ) : !newFilterDimension ? (
            <AddClauseEmptyState message="Add a filter">
              <FilterPopover
                query={query}
                onCommitFilter={filter =>
                  query.addFilter(filter).update(setDatasetQuery)
                }
              />
            </AddClauseEmptyState>
          ) : null}
          {newFilterDimension && (
            <FilterWidgetNew
              dimension={newFilterDimension}
              query={query}
              setDatasetQuery={setDatasetQuery}
              onRemove={() => this.setState({ newFilterDimension: null })}
            />
          )}
        </ClauseDropTarget>
        {children}
      </WorksheetSection>
    );
  }
}

const FilterWidget = ({ filter, index, query, setDatasetQuery }) => (
  <PopoverWithTrigger
    triggerElement={
      <Clause
        color={COLOR}
        onRemove={() => query.removeFilter(index).update(setDatasetQuery)}
      >
        <Filter filter={filter} metadata={query.metadata()} />
      </Clause>
    }
  >
    <FilterPopover
      query={query}
      filter={filter}
      onCommitFilter={filter =>
        query.updateFilter(index, filter).update(setDatasetQuery)
      }
      showFieldPicker={false}
    />
  </PopoverWithTrigger>
);

const FilterWidgetNew = ({ dimension, query, setDatasetQuery, onRemove }) => (
  <Clause color={COLOR}>
    <FieldName field={dimension.mbql()} query={query} />
    <Popover isOpen onClose={onRemove}>
      <FilterPopover
        query={query}
        filter={["=", dimension.mbql()]}
        onCommitFilter={filter => {
          query.addFilter(filter).update(setDatasetQuery);
        }}
        onClose={onRemove}
        showFieldPicker={false}
      />
    </Popover>
  </Clause>
);

export default FiltersSection;
